-- Fix: activate_premium_trial should grant first day's superlikes and ice breakers
-- Without this, a new premium user gets 0 superlikes and 0 ice breakers on day 1
-- because check_in_streak already ran before premium was activated.

CREATE OR REPLACE FUNCTION activate_premium_trial()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  already_had BOOLEAN;
BEGIN
  SELECT (is_premium OR premium_until IS NOT NULL) INTO already_had
  FROM profiles WHERE id = current_user_id;

  IF already_had THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_used');
  END IF;

  UPDATE profiles
  SET is_premium = TRUE, premium_until = NOW() + INTERVAL '7 days'
  WHERE id = current_user_id;

  -- Grant first day's premium bonus (superlikes + ice breakers)
  -- check_in_streak may have already run today before premium was active,
  -- so it missed the premium daily bonus. Grant it now.
  UPDATE user_streaks
  SET available_superlikes = available_superlikes + 1,
      available_ice_breakers = available_ice_breakers + 1
  WHERE user_id = current_user_id;

  RETURN jsonb_build_object('granted', true, 'premium_until', NOW() + INTERVAL '7 days');
END;
$$;
