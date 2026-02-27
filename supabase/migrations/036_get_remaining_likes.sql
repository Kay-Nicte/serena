-- =============================================================
-- Migration 036: remaining likes RPC, blocked-by RPC, fix streak
-- rewards (Day 10 = superlike, Day 15 = ice breaker + reset),
-- premium daily ice breaker, streak bonus range to < 15.
-- =============================================================

-- 1. RPC: get_remaining_likes
CREATE OR REPLACE FUNCTION get_remaining_likes()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  user_is_premium BOOLEAN;
  base_limit INT;
  streak_bonus INT := 0;
  total_limit INT;
  used_today INT;
BEGIN
  user_is_premium := is_user_premium(current_user_id);
  base_limit := CASE WHEN user_is_premium THEN 10 ELSE 5 END;

  SELECT CASE
    WHEN us.current_streak >= 2 AND us.current_streak < 15 AND us.last_active_date = today
    THEN 1 ELSE 0
  END INTO streak_bonus
  FROM user_streaks us WHERE us.user_id = current_user_id;
  streak_bonus := COALESCE(streak_bonus, 0);

  total_limit := base_limit + streak_bonus;

  SELECT COUNT(*) INTO used_today
  FROM daily_profiles
  WHERE user_id = current_user_id AND action_date = today AND action = 'like';

  RETURN jsonb_build_object(
    'total_limit', total_limit,
    'used_today', COALESCE(used_today, 0),
    'remaining', GREATEST(total_limit - COALESCE(used_today, 0), 0)
  );
END;
$$;

-- 2. RPC: get_users_who_blocked_me
CREATE OR REPLACE FUNCTION get_users_who_blocked_me()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(blocker_id), '{}')
  FROM user_blocks
  WHERE blocked_id = auth.uid();
$$;

-- 3. Fix check_in_streak: Day 10 = superlike, Day 15 = ice breaker + reset.
--    Premium daily: +1 superlike AND +1 ice breaker.
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

    premium := is_user_premium(current_user_id);
    IF premium THEN
      UPDATE user_streaks
      SET available_superlikes = available_superlikes + 1,
          available_ice_breakers = available_ice_breakers + 1
      WHERE user_id = current_user_id;
    END IF;

    RETURN jsonb_build_object(
      'current_streak', 1, 'longest_streak', 1, 'reward', NULL,
      'available_superlikes', CASE WHEN premium THEN 1 ELSE 0 END,
      'available_ice_breakers', CASE WHEN premium THEN 1 ELSE 0 END,
      'already_checked_in', false
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

  -- Day 15: ice breaker reward, reset streak to 1 (today counts as day 1)
  IF new_streak = 15 THEN
    reward_type := 'ice_breaker';
    UPDATE user_streaks
    SET current_streak = 1,
        longest_streak = GREATEST(rec.longest_streak, new_streak),
        last_active_date = today,
        available_ice_breakers = available_ice_breakers + 1
    WHERE user_id = current_user_id;
  -- Day 10: superlike reward
  ELSIF new_streak = 10 THEN
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

  -- Premium daily bonus: +1 superlike AND +1 ice breaker
  premium := is_user_premium(current_user_id);
  IF premium THEN
    UPDATE user_streaks
    SET available_superlikes = available_superlikes + 1,
        available_ice_breakers = available_ice_breakers + 1
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

-- 4. Fix like_profile: streak bonus range < 15 (was < 10)
CREATE OR REPLACE FUNCTION like_profile(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  daily_count INT;
  mutual BOOLEAN := FALSE;
  new_match_id UUID;
  canonical_a UUID;
  canonical_b UUID;
  user_is_premium BOOLEAN;
  base_limit INT;
  streak_bonus INT := 0;
  total_limit INT;
BEGIN
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot like yourself';
  END IF;

  IF are_users_blocked(current_user_id, target_user_id) THEN
    RETURN jsonb_build_object('error', 'user_blocked');
  END IF;

  user_is_premium := is_user_premium(current_user_id);
  base_limit := CASE WHEN user_is_premium THEN 10 ELSE 5 END;

  -- Streak bonus: +1 like if streak >= 2 and < 15 and checked in today
  SELECT CASE
    WHEN us.current_streak >= 2 AND us.current_streak < 15 AND us.last_active_date = today
    THEN 1 ELSE 0
  END INTO streak_bonus
  FROM user_streaks us WHERE us.user_id = current_user_id;
  streak_bonus := COALESCE(streak_bonus, 0);

  total_limit := base_limit + streak_bonus;

  SELECT COUNT(*) INTO daily_count
  FROM daily_profiles
  WHERE user_id = current_user_id AND action_date = today AND action = 'like';

  IF daily_count >= total_limit THEN
    RETURN jsonb_build_object('error', 'daily_limit_reached');
  END IF;

  INSERT INTO daily_profiles (user_id, target_id, action, action_date)
  VALUES (current_user_id, target_user_id, 'like', today)
  ON CONFLICT (user_id, target_id, action_date) DO NOTHING;

  -- Check mutual: other user liked OR superliked us
  SELECT EXISTS (
    SELECT 1 FROM daily_profiles
    WHERE user_id = target_user_id AND target_id = current_user_id
      AND action IN ('like', 'superlike')
  ) INTO mutual;

  IF mutual THEN
    canonical_a := LEAST(current_user_id, target_user_id);
    canonical_b := GREATEST(current_user_id, target_user_id);

    INSERT INTO matches (user_a_id, user_b_id)
    VALUES (canonical_a, canonical_b)
    ON CONFLICT (user_a_id, user_b_id) DO NOTHING
    RETURNING id INTO new_match_id;

    IF new_match_id IS NULL THEN
      SELECT id INTO new_match_id FROM matches
      WHERE user_a_id = canonical_a AND user_b_id = canonical_b;
    END IF;

    RETURN jsonb_build_object('matched', true, 'match_id', new_match_id);
  END IF;

  RETURN jsonb_build_object('matched', false);
END;
$$;
