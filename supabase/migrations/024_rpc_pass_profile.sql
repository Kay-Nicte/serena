-- RPC: pass_profile
-- Atomic function that inserts a pass action with server-side validation.
-- Uses SECURITY DEFINER to ensure proper access control.

CREATE OR REPLACE FUNCTION pass_profile(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
BEGIN
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot pass yourself';
  END IF;

  INSERT INTO daily_profiles (user_id, target_id, action, action_date)
  VALUES (current_user_id, target_user_id, 'pass', today)
  ON CONFLICT (user_id, target_id, action_date) DO NOTHING;

  RETURN jsonb_build_object('success', true);
END;
$$;
