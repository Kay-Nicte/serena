-- Account deletion RPC
-- Deletes the user's profile and all associated data.
-- Profile photos from storage are cleaned up via CASCADE on the photos table.
-- Chat images must be cleaned up client-side before calling this function,
-- since Supabase storage API cannot be easily called from PL/pgSQL.

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

  -- Delete the profile (this would also CASCADE, but being explicit)
  DELETE FROM profiles WHERE id = current_user_id;

  -- Delete the auth user
  DELETE FROM auth.users WHERE id = current_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
