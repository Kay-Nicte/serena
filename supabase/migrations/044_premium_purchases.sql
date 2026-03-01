-- =============================================================
-- Premium purchases: RPC to activate a paid subscription
-- Called from the app after a successful RevenueCat purchase,
-- and also from the RevenueCat webhook as a backup.
-- =============================================================

-- RPC: activate a premium purchase with a specific end date
-- Called with the expiration date from RevenueCat entitlement
CREATE OR REPLACE FUNCTION activate_premium_purchase(premium_until_ts TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  parsed_ts TIMESTAMPTZ;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  parsed_ts := premium_until_ts::TIMESTAMPTZ;

  UPDATE profiles
  SET is_premium = TRUE,
      premium_until = parsed_ts
  WHERE id = current_user_id;

  -- Grant premium daily bonus if not already granted today
  UPDATE user_streaks
  SET available_superlikes = GREATEST(available_superlikes, 1),
      available_ice_breakers = GREATEST(available_ice_breakers, 1)
  WHERE user_id = current_user_id;
END;
$$;

-- RPC: webhook handler for RevenueCat events (called by Edge Function with service role)
-- This uses a service-role key, so auth.uid() won't be set.
-- Instead, the RevenueCat app_user_id (which is the Supabase user UUID) is passed.
CREATE OR REPLACE FUNCTION handle_revenuecat_webhook(
  rc_user_id UUID,
  rc_event_type TEXT,
  rc_expiration_date TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parsed_ts TIMESTAMPTZ;
BEGIN
  IF rc_event_type IN ('INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION') THEN
    -- Activate or extend premium
    parsed_ts := CASE WHEN rc_expiration_date IS NOT NULL
                      THEN rc_expiration_date::TIMESTAMPTZ
                      ELSE NULL END;

    UPDATE profiles
    SET is_premium = TRUE,
        premium_until = parsed_ts
    WHERE id = rc_user_id;

  ELSIF rc_event_type IN ('EXPIRATION', 'BILLING_ISSUE') THEN
    -- Deactivate premium
    UPDATE profiles
    SET is_premium = FALSE
    WHERE id = rc_user_id;

  ELSIF rc_event_type = 'CANCELLATION' THEN
    -- User cancelled but may still have time left — don't deactivate yet.
    -- The EXPIRATION event will handle the actual deactivation.
    NULL;
  END IF;
END;
$$;
