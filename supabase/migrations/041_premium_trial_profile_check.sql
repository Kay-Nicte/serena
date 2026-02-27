-- Premium trial should only be granted when the user's profile is fully complete.
-- All fields must be filled EXCEPT hogwarts_house (which is purely fun/optional).
-- This prevents users from getting premium just by registering with minimal info.

CREATE OR REPLACE FUNCTION activate_premium_trial()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  p RECORD;
  has_photo BOOLEAN;
BEGIN
  SELECT * INTO p FROM profiles WHERE id = current_user_id;

  IF p IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'no_profile');
  END IF;

  -- Check if already had premium
  IF p.is_premium OR p.premium_until IS NOT NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_used');
  END IF;

  -- Check profile completeness (all fields except hogwarts_house)
  IF p.name IS NULL OR trim(p.name) = '' THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.birth_date IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.bio IS NULL OR trim(p.bio) = '' THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.orientation IS NULL OR array_length(p.orientation, 1) IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.looking_for IS NULL OR array_length(p.looking_for, 1) IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.interests IS NULL OR array_length(p.interests, 1) IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.children IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.zodiac IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.zodiac_ascendant IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.pets IS NULL OR array_length(p.pets, 1) IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.smoking IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.drinking IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;
  IF p.height_cm IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;

  -- Check at least one photo
  SELECT EXISTS(
    SELECT 1 FROM photos WHERE user_id = current_user_id LIMIT 1
  ) INTO has_photo;

  IF NOT has_photo THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'incomplete_profile');
  END IF;

  -- All checks passed — grant 7-day premium trial
  UPDATE profiles
  SET is_premium = TRUE, premium_until = NOW() + INTERVAL '7 days'
  WHERE id = current_user_id;

  -- Grant first day's premium bonus (superlikes + ice breakers)
  UPDATE user_streaks
  SET available_superlikes = available_superlikes + 1,
      available_ice_breakers = available_ice_breakers + 1
  WHERE user_id = current_user_id;

  RETURN jsonb_build_object('granted', true, 'premium_until', NOW() + INTERVAL '7 days');
END;
$$;
