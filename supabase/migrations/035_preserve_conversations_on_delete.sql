-- Preserve conversations when a user deletes their account.
-- Instead of deleting messages and matches, anonymize the profile
-- so the other user keeps their conversation history.

-- 1. Add deleted_at column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. FK profiles → auth.users already removed (no constraint exists).

-- 3. RPC to check if another user has blocked the caller.
-- Needed because RLS on user_blocks only allows viewing own blocks.
CREATE OR REPLACE FUNCTION is_blocked_by(other_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_blocks
    WHERE blocker_id = other_user_id
      AND blocked_id = auth.uid()
  );
$$;

-- 4. Replace delete_own_account to anonymize instead of delete
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

  -- DO NOT delete messages or matches — the other user keeps the conversation.

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

  -- Anonymize the profile instead of deleting it.
  -- This preserves FK references from matches and messages.
  UPDATE profiles
  SET name = NULL,
      bio = NULL,
      avatar_url = NULL,
      birth_date = NULL,
      location = NULL,
      orientation = NULL,
      looking_for = NULL,
      is_profile_complete = false,
      deleted_at = NOW()
  WHERE id = current_user_id;

  -- Clean up auth tables (order matters)
  DELETE FROM auth.mfa_factors WHERE user_id = current_user_id;
  DELETE FROM auth.refresh_tokens WHERE session_id IN (
    SELECT id FROM auth.sessions WHERE user_id = current_user_id
  );
  DELETE FROM auth.sessions WHERE user_id = current_user_id;
  DELETE FROM auth.identities WHERE user_id = current_user_id;

  -- Delete the auth user. The profile stays as an anonymized tombstone
  -- so matches and messages remain intact for the other party.
  DELETE FROM auth.users WHERE id = current_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
