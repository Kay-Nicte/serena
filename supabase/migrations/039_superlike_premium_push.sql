-- Update superlike_profile: premium targets see sender name in push notification
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
  target_is_premium BOOLEAN;
  sender_name TEXT;
  push_body TEXT;
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

  -- Build push body: premium targets see sender name
  SELECT COALESCE(p.is_premium, FALSE) INTO target_is_premium
  FROM profiles p WHERE p.id = target_user_id;

  IF target_is_premium THEN
    SELECT p.name INTO sender_name FROM profiles p WHERE p.id = current_user_id;
    push_body := COALESCE(sender_name, 'Alguien') || ' te ha dado un superlike!';
  ELSE
    push_body := '¡Alguien te ha dado un superlike!';
  END IF;

  PERFORM send_push_notification(
    target_user_id,
    '⭐ Superlike!',
    push_body,
    jsonb_build_object('type', 'superlike', 'sender_id', current_user_id)
  );

  RETURN jsonb_build_object('matched', false);
END;
$$;

-- RPC: get_superlike_senders — returns IDs of users who superliked the current user (unmatched)
CREATE OR REPLACE FUNCTION get_superlike_senders()
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  RETURN QUERY
  SELECT dp.user_id
  FROM daily_profiles dp
  WHERE dp.target_id = current_user_id
    AND dp.action = 'superlike'
    AND NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user_a_id = LEAST(dp.user_id, current_user_id)
        AND m.user_b_id = GREATEST(dp.user_id, current_user_id))
    );
END;
$$;
