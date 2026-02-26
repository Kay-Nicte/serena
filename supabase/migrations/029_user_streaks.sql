-- =============================================================
-- User Streaks: table, RLS, check-in RPC
-- =============================================================

CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE DEFAULT NULL,
  available_superlikes INT NOT NULL DEFAULT 0,
  available_ice_breakers INT NOT NULL DEFAULT 0
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own streak" ON user_streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON user_streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON user_streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RPC: check_in_streak - called on every app open, idempotent
CREATE OR REPLACE FUNCTION check_in_streak()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - 1;
  rec RECORD;
  new_streak INT;
  reward_type TEXT := NULL;
  premium BOOLEAN;
BEGIN
  SELECT * INTO rec FROM user_streaks WHERE user_id = current_user_id;

  -- First time ever
  IF rec IS NULL THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date)
    VALUES (current_user_id, 1, 1, today);

    -- Premium daily superlike
    premium := is_user_premium(current_user_id);
    IF premium THEN
      UPDATE user_streaks SET available_superlikes = available_superlikes + 1 WHERE user_id = current_user_id;
    END IF;

    RETURN jsonb_build_object(
      'current_streak', 1, 'longest_streak', 1, 'reward', NULL,
      'available_superlikes', CASE WHEN premium THEN 1 ELSE 0 END,
      'available_ice_breakers', 0, 'already_checked_in', false
    );
  END IF;

  -- Already checked in today
  IF rec.last_active_date = today THEN
    RETURN jsonb_build_object(
      'current_streak', rec.current_streak, 'longest_streak', rec.longest_streak,
      'reward', NULL, 'available_superlikes', rec.available_superlikes,
      'available_ice_breakers', rec.available_ice_breakers, 'already_checked_in', true
    );
  END IF;

  -- Calculate new streak
  IF rec.last_active_date = yesterday THEN
    new_streak := rec.current_streak + 1;
  ELSE
    new_streak := 1; -- streak broken, restart
  END IF;

  -- Day 10: ice breaker reward, reset streak
  IF new_streak = 10 THEN
    reward_type := 'ice_breaker';
    UPDATE user_streaks
    SET current_streak = 0,
        longest_streak = GREATEST(rec.longest_streak, new_streak),
        last_active_date = today,
        available_ice_breakers = available_ice_breakers + 1
    WHERE user_id = current_user_id;
  -- Day 5: superlike reward
  ELSIF new_streak = 5 THEN
    reward_type := 'superlike';
    UPDATE user_streaks
    SET current_streak = new_streak,
        longest_streak = GREATEST(rec.longest_streak, new_streak),
        last_active_date = today,
        available_superlikes = available_superlikes + 1
    WHERE user_id = current_user_id;
  ELSE
    UPDATE user_streaks
    SET current_streak = new_streak,
        longest_streak = GREATEST(rec.longest_streak, new_streak),
        last_active_date = today
    WHERE user_id = current_user_id;
  END IF;

  -- Premium daily superlike bonus
  premium := is_user_premium(current_user_id);
  IF premium THEN
    UPDATE user_streaks
    SET available_superlikes = available_superlikes + 1
    WHERE user_id = current_user_id;
  END IF;

  RETURN jsonb_build_object(
    'current_streak', (SELECT current_streak FROM user_streaks WHERE user_id = current_user_id),
    'longest_streak', (SELECT longest_streak FROM user_streaks WHERE user_id = current_user_id),
    'reward', reward_type,
    'available_superlikes', (SELECT available_superlikes FROM user_streaks WHERE user_id = current_user_id),
    'available_ice_breakers', (SELECT available_ice_breakers FROM user_streaks WHERE user_id = current_user_id),
    'already_checked_in', false
  );
END;
$$;
