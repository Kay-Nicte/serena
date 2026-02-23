-- RPC: like_profile
-- Atomic function that inserts a like, checks for mutual like, and creates match if mutual.
-- Uses SECURITY DEFINER to read the other user's likes.
-- Enforces 10 likes/day server-side.

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
BEGIN
  -- Validate not liking self
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot like yourself';
  END IF;

  -- Check daily limit (likes only)
  SELECT COUNT(*) INTO daily_count
  FROM daily_profiles
  WHERE user_id = current_user_id
    AND action_date = today
    AND action = 'like';

  IF daily_count >= 10 THEN
    RETURN jsonb_build_object('error', 'daily_limit_reached');
  END IF;

  -- Insert the like action
  INSERT INTO daily_profiles (user_id, target_id, action, action_date)
  VALUES (current_user_id, target_user_id, 'like', today)
  ON CONFLICT (user_id, target_id, action_date) DO NOTHING;

  -- Check if the other user has already liked us (any day)
  SELECT EXISTS (
    SELECT 1 FROM daily_profiles
    WHERE user_id = target_user_id
      AND target_id = current_user_id
      AND action = 'like'
  ) INTO mutual;

  -- If mutual like, create match
  IF mutual THEN
    -- Canonical ordering: smaller UUID first
    IF current_user_id < target_user_id THEN
      canonical_a := current_user_id;
      canonical_b := target_user_id;
    ELSE
      canonical_a := target_user_id;
      canonical_b := current_user_id;
    END IF;

    -- Insert match (ignore if already exists)
    INSERT INTO matches (user_a_id, user_b_id)
    VALUES (canonical_a, canonical_b)
    ON CONFLICT (user_a_id, user_b_id) DO NOTHING
    RETURNING id INTO new_match_id;

    -- If match was already existing, fetch its id
    IF new_match_id IS NULL THEN
      SELECT id INTO new_match_id
      FROM matches
      WHERE user_a_id = canonical_a AND user_b_id = canonical_b;
    END IF;

    RETURN jsonb_build_object(
      'matched', true,
      'match_id', new_match_id
    );
  END IF;

  RETURN jsonb_build_object('matched', false);
END;
$$;
