-- =============================================================
-- Premium System: columns, helper, trial activation, status RPC
-- =============================================================

-- Add premium columns to profiles
ALTER TABLE profiles
  ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN premium_until TIMESTAMPTZ DEFAULT NULL;

-- Helper: check if user is currently premium (reusable by other RPCs)
CREATE OR REPLACE FUNCTION is_user_premium(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_premium AND (premium_until IS NULL OR premium_until > NOW())
     FROM profiles WHERE id = uid),
    FALSE
  );
$$;

-- RPC: activate 7-day free trial (only if never had premium)
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

  RETURN jsonb_build_object('granted', true, 'premium_until', NOW() + INTERVAL '7 days');
END;
$$;

-- RPC: get current premium status (auto-expires if past date)
CREATE OR REPLACE FUNCTION get_premium_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  rec RECORD;
BEGIN
  SELECT is_premium, premium_until INTO rec
  FROM profiles WHERE id = current_user_id;

  IF rec.is_premium AND rec.premium_until IS NOT NULL AND rec.premium_until <= NOW() THEN
    UPDATE profiles SET is_premium = FALSE WHERE id = current_user_id;
    RETURN jsonb_build_object('is_premium', false, 'premium_until', rec.premium_until, 'expired', true);
  END IF;

  RETURN jsonb_build_object(
    'is_premium', COALESCE(rec.is_premium, false),
    'premium_until', rec.premium_until,
    'expired', false
  );
END;
$$;
