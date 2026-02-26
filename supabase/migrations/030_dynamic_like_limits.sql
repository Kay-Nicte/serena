-- =============================================================
-- Dynamic Like Limits: rewrite like_profile with premium + streak awareness
-- Preserves block check from 018 and canonical match ordering
-- =============================================================

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

  -- Streak bonus: +1 like if streak >= 2 and < 10 and checked in today
  SELECT CASE
    WHEN us.current_streak >= 2 AND us.current_streak < 10 AND us.last_active_date = today
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
