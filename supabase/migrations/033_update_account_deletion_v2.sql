-- Update delete_own_account to handle all new tables and auth cleanup
-- Previous version failed because auth.identities or auth.sessions
-- may block deletion of auth.users.

CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  photo_paths TEXT[];
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Collect profile photo storage paths before deleting records
  SELECT ARRAY_AGG(storage_path) INTO photo_paths
  FROM photos
  WHERE user_id = current_user_id;

  -- Delete profile photo files from storage
  IF photo_paths IS NOT NULL AND array_length(photo_paths, 1) > 0 THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'profile-photos'
      AND name = ANY(photo_paths);
  END IF;

  -- Delete push tokens
  DELETE FROM push_tokens WHERE user_id = current_user_id;

  -- Delete ice breakers (sent or received)
  DELETE FROM ice_breakers
  WHERE sender_id = current_user_id OR recipient_id = current_user_id;

  -- Delete messages in user's matches
  DELETE FROM messages
  WHERE match_id IN (
    SELECT id FROM matches
    WHERE user_a_id = current_user_id OR user_b_id = current_user_id
  );

  -- Delete matches
  DELETE FROM matches
  WHERE user_a_id = current_user_id OR user_b_id = current_user_id;

  -- Delete daily profiles (swipe history)
  DELETE FROM daily_profiles
  WHERE user_id = current_user_id OR target_id = current_user_id;

  -- Delete photos records
  DELETE FROM photos WHERE user_id = current_user_id;

  -- Delete reports by or about this user
  DELETE FROM reports
  WHERE reporter_id = current_user_id OR reported_id = current_user_id;

  -- Delete user streaks
  DELETE FROM user_streaks WHERE user_id = current_user_id;

  -- Delete user presence
  DELETE FROM user_presence WHERE user_id = current_user_id;

  -- Delete blocked users (as blocker or blocked)
  DELETE FROM blocked_users
  WHERE blocker_id = current_user_id OR blocked_id = current_user_id;

  -- Delete the profile
  DELETE FROM profiles WHERE id = current_user_id;

  -- Clean up auth tables that may not cascade (order matters)
  DELETE FROM auth.mfa_factors WHERE user_id = current_user_id;
  DELETE FROM auth.refresh_tokens WHERE session_id IN (
    SELECT id FROM auth.sessions WHERE user_id = current_user_id
  );
  DELETE FROM auth.sessions WHERE user_id = current_user_id;
  DELETE FROM auth.identities WHERE user_id = current_user_id;

  -- Finally delete the auth user
  DELETE FROM auth.users WHERE id = current_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
