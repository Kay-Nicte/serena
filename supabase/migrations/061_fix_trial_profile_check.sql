-- Fix: activate_premium_trial must verify profile completeness before granting
-- Required fields match the diamond-marked fields in the app
CREATE OR REPLACE FUNCTION activate_premium_trial()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile profiles%ROWTYPE;
  v_photo_count INT;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;

  -- Only grant if user has never had premium
  IF v_profile.premium_until IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_used');
  END IF;

  -- Count photos
  SELECT COUNT(*) INTO v_photo_count FROM photos WHERE user_id = v_user_id;

  -- Check all required fields (matching client-side profileRequiredChecks)
  IF v_profile.name IS NULL OR TRIM(v_profile.name) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.birth_date IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.bio IS NULL OR TRIM(v_profile.bio) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.orientation IS NULL OR array_length(v_profile.orientation, 1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.looking_for IS NULL OR array_length(v_profile.looking_for, 1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.interests IS NULL OR array_length(v_profile.interests, 1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.children IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.zodiac IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.zodiac_ascendant IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.pets IS NULL OR array_length(v_profile.pets, 1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.smoking IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.drinking IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.height_cm IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.relationship_type IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.languages IS NULL OR array_length(v_profile.languages, 1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.profession IS NULL OR TRIM(v_profile.profession) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.exercise IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_profile.music_genres IS NULL OR array_length(v_profile.music_genres, 1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;
  IF v_photo_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'incomplete_profile');
  END IF;

  -- All checks passed, grant trial
  UPDATE profiles
  SET
    is_premium = true,
    premium_until = NOW() + INTERVAL '7 days',
    is_trial = true
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'granted', true);
END;
$$;
