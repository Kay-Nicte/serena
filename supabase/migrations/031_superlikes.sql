-- Add superlike to daily_action enum
ALTER TYPE daily_action ADD VALUE 'superlike';

-- RPC: superlike_profile
CREATE OR REPLACE FUNCTION superlike_profile(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  available INT;
  mutual BOOLEAN := FALSE;
  new_match_id UUID;
  canonical_a UUID;
  canonical_b UUID;
BEGIN
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot superlike yourself';
  END IF;

  IF are_users_blocked(current_user_id, target_user_id) THEN
    RETURN jsonb_build_object('error', 'user_blocked');
  END IF;

  SELECT available_superlikes INTO available
  FROM user_streaks WHERE user_id = current_user_id;

  IF COALESCE(available, 0) <= 0 THEN
    RETURN jsonb_build_object('error', 'no_superlikes_available');
  END IF;

  -- Check not already swiped today
  IF EXISTS (
    SELECT 1 FROM daily_profiles
    WHERE user_id = current_user_id AND target_id = target_user_id AND action_date = today
  ) THEN
    RETURN jsonb_build_object('error', 'already_swiped');
  END IF;

  INSERT INTO daily_profiles (user_id, target_id, action, action_date)
  VALUES (current_user_id, target_user_id, 'superlike', today);

  UPDATE user_streaks SET available_superlikes = available_superlikes - 1
  WHERE user_id = current_user_id;

  -- Check mutual (like or superlike from the other side)
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

  -- Push notification
  PERFORM send_push_notification(
    target_user_id,
    '⭐ Superlike!',
    'Someone sent you a superlike!',
    jsonb_build_object('type', 'superlike', 'sender_id', current_user_id)
  );

  RETURN jsonb_build_object('matched', false);
END;
$$;

-- Update get_daily_candidates: superlikers appear first
CREATE OR REPLACE FUNCTION get_daily_candidates(candidate_limit INT DEFAULT 10)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  pref RECORD;
  user_location GEOGRAPHY;
BEGIN
  SELECT p.location INTO user_location FROM profiles p WHERE p.id = current_user_id;
  SELECT dp.min_age, dp.max_age, dp.orientations, dp.looking_for, dp.max_distance
    INTO pref FROM discovery_preferences dp WHERE dp.user_id = current_user_id;

  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.name IS NOT NULL AND p.name != ''
    AND p.banned_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM daily_profiles d WHERE d.user_id = current_user_id AND d.target_id = p.id AND d.action_date = today)
    AND NOT EXISTS (SELECT 1 FROM matches m WHERE (m.user_a_id = current_user_id AND m.user_b_id = p.id) OR (m.user_a_id = p.id AND m.user_b_id = current_user_id))
    AND NOT EXISTS (SELECT 1 FROM user_blocks ub WHERE (ub.blocker_id = current_user_id AND ub.blocked_id = p.id) OR (ub.blocker_id = p.id AND ub.blocked_id = current_user_id))
    AND (pref IS NULL OR p.birth_date IS NULL OR EXTRACT(YEAR FROM AGE(p.birth_date)) BETWEEN pref.min_age AND pref.max_age)
    AND (pref IS NULL OR pref.orientations IS NULL OR p.orientation::text = ANY(pref.orientations))
    AND (pref IS NULL OR pref.looking_for IS NULL OR p.looking_for::text = ANY(pref.looking_for))
    AND (user_location IS NULL OR pref IS NULL OR pref.max_distance IS NULL OR p.location IS NULL OR ST_DWithin(user_location, p.location, pref.max_distance * 1000))
  ORDER BY
    CASE WHEN EXISTS (
      SELECT 1 FROM daily_profiles sl WHERE sl.user_id = p.id AND sl.target_id = current_user_id AND sl.action = 'superlike'
    ) THEN 0 ELSE 1 END,
    CASE WHEN user_location IS NOT NULL AND p.location IS NOT NULL THEN ST_Distance(user_location, p.location) ELSE random() * 1e12 END
  LIMIT candidate_limit;
END;
$$;
