-- Fix: remove direct storage.objects deletion (not allowed by Supabase).
-- Photo cleanup must be done client-side via Storage API before calling this RPC.

CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
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

  -- Delete photos records (storage files cleaned up client-side)
  DELETE FROM photos WHERE user_id = current_user_id;

  -- Delete reports by or about this user
  DELETE FROM reports
  WHERE reporter_id = current_user_id OR reported_id = current_user_id;

  -- Delete user streaks
  DELETE FROM user_streaks WHERE user_id = current_user_id;

  -- Delete user presence
  DELETE FROM user_presence WHERE user_id = current_user_id;

  -- Delete blocked users (as blocker or blocked)
  DELETE FROM user_blocks
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
