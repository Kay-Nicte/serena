-- RPC: reset_daily_passes
-- Deletes today's "pass" actions so those profiles appear again in discovery.
-- Does NOT reset likes (those are intentional).

CREATE OR REPLACE FUNCTION reset_daily_passes()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  deleted_count INT;
BEGIN
  DELETE FROM daily_profiles
  WHERE user_id = current_user_id
    AND action_date = today
    AND action = 'pass';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN jsonb_build_object('success', true, 'reset_count', deleted_count);
END;
$$;
