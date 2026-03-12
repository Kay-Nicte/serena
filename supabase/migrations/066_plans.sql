-- Plans feature: community events/meetups

CREATE TYPE plan_category AS ENUM ('viajes', 'ocio', 'cultura');

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  category plan_category NOT NULL,
  location_name TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326),
  event_date TIMESTAMPTZ NOT NULL,
  max_attendees INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plan_attendees (
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (plan_id, user_id)
);

CREATE INDEX idx_plans_location ON plans USING GIST (location);
CREATE INDEX idx_plans_event_date ON plans(event_date);
CREATE INDEX idx_plans_category ON plans(category);
CREATE INDEX idx_plans_creator ON plans(creator_id);
CREATE INDEX idx_plan_attendees_user ON plan_attendees(user_id);

-- RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_attendees ENABLE ROW LEVEL SECURITY;

-- Plans: anyone authenticated can read active future plans
CREATE POLICY "plans_select" ON plans FOR SELECT TO authenticated
  USING (is_active = TRUE AND event_date >= NOW());

-- Plans: authenticated users can create their own
CREATE POLICY "plans_insert" ON plans FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Plans: only creator can update
CREATE POLICY "plans_update" ON plans FOR UPDATE TO authenticated
  USING (creator_id = auth.uid());

-- Plans: only creator can delete
CREATE POLICY "plans_delete" ON plans FOR DELETE TO authenticated
  USING (creator_id = auth.uid());

-- Attendees: anyone authenticated can read
CREATE POLICY "plan_attendees_select" ON plan_attendees FOR SELECT TO authenticated
  USING (TRUE);

-- Attendees: can join (insert self)
CREATE POLICY "plan_attendees_insert" ON plan_attendees FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Attendees: can leave (delete self)
CREATE POLICY "plan_attendees_delete" ON plan_attendees FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Creator is auto-added as attendee
CREATE OR REPLACE FUNCTION auto_join_plan_creator()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO plan_attendees (plan_id, user_id) VALUES (NEW.id, NEW.creator_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auto_join_plan_creator
  AFTER INSERT ON plans
  FOR EACH ROW EXECUTE FUNCTION auto_join_plan_creator();

-- RPC: get plans with attendee count and creator info
CREATE OR REPLACE FUNCTION get_plans(
  p_category TEXT DEFAULT NULL,
  p_near_lat DOUBLE PRECISION DEFAULT NULL,
  p_near_lng DOUBLE PRECISION DEFAULT NULL,
  p_max_distance_km INTEGER DEFAULT 50,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  creator_id UUID,
  creator_name TEXT,
  creator_avatar TEXT,
  title TEXT,
  description TEXT,
  category plan_category,
  location_name TEXT,
  event_date TIMESTAMPTZ,
  max_attendees INTEGER,
  attendee_count BIGINT,
  is_joined BOOLEAN,
  is_creator BOOLEAN,
  created_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION
) AS $$
DECLARE
  user_point GEOGRAPHY;
BEGIN
  IF p_near_lat IS NOT NULL AND p_near_lng IS NOT NULL THEN
    user_point := ST_SetSRID(ST_MakePoint(p_near_lng, p_near_lat), 4326)::geography;
  END IF;

  RETURN QUERY
  SELECT
    pl.id,
    pl.creator_id,
    pr.name::TEXT AS creator_name,
    pr.avatar_url::TEXT AS creator_avatar,
    pl.title,
    pl.description,
    pl.category,
    pl.location_name,
    pl.event_date,
    pl.max_attendees,
    (SELECT COUNT(*) FROM plan_attendees pa WHERE pa.plan_id = pl.id) AS attendee_count,
    EXISTS(SELECT 1 FROM plan_attendees pa WHERE pa.plan_id = pl.id AND pa.user_id = auth.uid()) AS is_joined,
    (pl.creator_id = auth.uid()) AS is_creator,
    pl.created_at,
    CASE
      WHEN user_point IS NOT NULL AND pl.location IS NOT NULL
      THEN ROUND(ST_Distance(user_point, pl.location)::numeric / 1000, 1)::double precision
      ELSE NULL
    END AS distance_km
  FROM plans pl
  JOIN profiles pr ON pr.id = pl.creator_id
  WHERE pl.is_active = TRUE
    AND pl.event_date >= NOW()
    AND (p_category IS NULL OR pl.category = p_category::plan_category)
    AND (
      user_point IS NULL
      OR pl.location IS NULL
      OR ST_DWithin(user_point, pl.location, p_max_distance_km * 1000)
    )
  ORDER BY
    CASE WHEN user_point IS NOT NULL AND pl.location IS NOT NULL
      THEN ST_Distance(user_point, pl.location)
      ELSE 0
    END,
    pl.event_date ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: join a plan (with max attendees check)
CREATE OR REPLACE FUNCTION join_plan(p_plan_id UUID)
RETURNS VOID AS $$
DECLARE
  v_max INTEGER;
  v_current BIGINT;
BEGIN
  SELECT max_attendees INTO v_max FROM plans WHERE id = p_plan_id AND is_active = TRUE FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found';
  END IF;

  IF v_max IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current FROM plan_attendees WHERE plan_id = p_plan_id;
    IF v_current >= v_max THEN
      RAISE EXCEPTION 'Plan is full';
    END IF;
  END IF;

  INSERT INTO plan_attendees (plan_id, user_id) VALUES (p_plan_id, auth.uid())
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: leave a plan
CREATE OR REPLACE FUNCTION leave_plan(p_plan_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM plan_attendees WHERE plan_id = p_plan_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: get plan attendees with profile info
CREATE OR REPLACE FUNCTION get_plan_attendees(p_plan_id UUID)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pa.user_id,
    pr.name::TEXT,
    pr.avatar_url::TEXT,
    pa.joined_at
  FROM plan_attendees pa
  JOIN profiles pr ON pr.id = pa.user_id
  WHERE pa.plan_id = p_plan_id
  ORDER BY pa.joined_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
