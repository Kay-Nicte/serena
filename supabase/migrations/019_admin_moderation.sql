-- =============================================================
-- Admin Moderation: is_admin, banned_at, RPCs y notificación
-- push a admins cuando llega un reporte nuevo
-- =============================================================

-- 1. Añadir campos admin y ban a profiles
ALTER TABLE profiles
  ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE profiles
  ADD COLUMN banned_at TIMESTAMPTZ DEFAULT NULL;

-- 2. RLS: admins pueden leer todos los reportes
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- 3. RLS: admins pueden actualizar reportes (cambiar status)
CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- 4. RLS: admins pueden leer todos los bloqueos (para moderación)
CREATE POLICY "Admins can view all blocks"
  ON user_blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- 5. RPC: ban_user (solo admins)
CREATE OR REPLACE FUNCTION ban_user(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  is_caller_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO is_caller_admin
  FROM profiles WHERE id = current_user_id;

  IF NOT is_caller_admin THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  UPDATE profiles
  SET banned_at = NOW()
  WHERE id = target_user_id
    AND banned_at IS NULL;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 6. RPC: unban_user (solo admins)
CREATE OR REPLACE FUNCTION unban_user(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  is_caller_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO is_caller_admin
  FROM profiles WHERE id = current_user_id;

  IF NOT is_caller_admin THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  UPDATE profiles
  SET banned_at = NULL
  WHERE id = target_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 7. RPC: resolve_report (solo admins)
CREATE OR REPLACE FUNCTION resolve_report(report_id UUID, new_status report_status)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  is_caller_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO is_caller_admin
  FROM profiles WHERE id = current_user_id;

  IF NOT is_caller_admin THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  UPDATE reports
  SET status = new_status,
      resolved_at = CASE WHEN new_status IN ('resolved', 'dismissed') THEN NOW() ELSE resolved_at END
  WHERE id = report_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 8. Actualizar get_daily_candidates para excluir baneados
CREATE OR REPLACE FUNCTION get_daily_candidates(candidate_limit INT DEFAULT 10)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  pref RECORD;
  user_location GEOGRAPHY;
BEGIN
  SELECT p.location INTO user_location
    FROM profiles p
   WHERE p.id = current_user_id;

  SELECT dp.min_age, dp.max_age, dp.orientations, dp.looking_for, dp.max_distance
    INTO pref
    FROM discovery_preferences dp
   WHERE dp.user_id = current_user_id;

  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.is_profile_complete = true
    AND p.banned_at IS NULL
    -- Exclude already swiped today
    AND NOT EXISTS (
      SELECT 1 FROM daily_profiles d
      WHERE d.user_id = current_user_id
        AND d.target_id = p.id
        AND d.action_date = today
    )
    -- Exclude already matched
    AND NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user_a_id = current_user_id AND m.user_b_id = p.id)
         OR (m.user_a_id = p.id AND m.user_b_id = current_user_id)
    )
    -- Exclude blocked users (both directions)
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks ub
      WHERE (ub.blocker_id = current_user_id AND ub.blocked_id = p.id)
         OR (ub.blocker_id = p.id AND ub.blocked_id = current_user_id)
    )
    -- Age filter
    AND (
      pref IS NULL
      OR p.birth_date IS NULL
      OR EXTRACT(YEAR FROM AGE(p.birth_date)) BETWEEN pref.min_age AND pref.max_age
    )
    -- Orientation filter
    AND (
      pref IS NULL
      OR pref.orientations IS NULL
      OR p.orientation::text = ANY(pref.orientations)
    )
    -- Looking-for filter
    AND (
      pref IS NULL
      OR pref.looking_for IS NULL
      OR p.looking_for::text = ANY(pref.looking_for)
    )
    -- Distance filter
    AND (
      user_location IS NULL
      OR pref IS NULL
      OR pref.max_distance IS NULL
      OR p.location IS NULL
      OR ST_DWithin(user_location, p.location, pref.max_distance * 1000)
    )
  ORDER BY
    CASE
      WHEN user_location IS NOT NULL AND p.location IS NOT NULL
      THEN ST_Distance(user_location, p.location)
      ELSE random() * 1e12
    END
  LIMIT candidate_limit;
END;
$$;

-- 9. Trigger: notificar a admins cuando llega un reporte nuevo
CREATE OR REPLACE FUNCTION notify_admins_new_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin RECORD;
  v_reporter_name text;
  v_reported_name text;
BEGIN
  SELECT name INTO v_reporter_name FROM profiles WHERE id = NEW.reporter_id;
  SELECT name INTO v_reported_name FROM profiles WHERE id = NEW.reported_id;

  FOR v_admin IN
    SELECT id FROM profiles WHERE is_admin = true
  LOOP
    PERFORM public.send_push_notification(
      v_admin.id,
      'Nuevo reporte',
      COALESCE(v_reporter_name, 'Alguien') || ' ha reportado a ' || COALESCE(v_reported_name, 'una usuaria') || ' (' || NEW.reason::text || ')',
      jsonb_build_object('type', 'new_report', 'report_id', NEW.id)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admins_new_report
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_new_report();
