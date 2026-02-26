-- 021: Account deletion RPC and language preference

-- 1. Add language preference column to profiles
ALTER TABLE profiles ADD COLUMN language_preference TEXT DEFAULT NULL
  CHECK (language_preference IN ('en', 'es'));

-- 2. RPC to delete own account (GDPR / Google Play requirement)
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete profile photos from storage
  DELETE FROM storage.objects
  WHERE bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = _uid::text;

  -- Delete the auth user — CASCADE handles profiles, photos, matches,
  -- messages, reports, user_blocks, push_tokens, daily_profiles,
  -- discovery_preferences
  DELETE FROM auth.users WHERE id = _uid;

  RETURN json_build_object('success', true);
END;
$$;
