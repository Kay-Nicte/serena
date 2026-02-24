-- Geolocation: distance filter for discovery + location update RPC.

-- 1. Add max_distance to discovery_preferences (km, NULL = no limit)
ALTER TABLE discovery_preferences
  ADD COLUMN max_distance INTEGER DEFAULT NULL;

-- 2. Spatial index on profiles.location for efficient distance queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIST (location);

-- 3. RPC to update user location from device coordinates
CREATE OR REPLACE FUNCTION update_user_location(lat DOUBLE PRECISION, lng DOUBLE PRECISION)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY
  WHERE id = auth.uid();
END;
$$;

-- 4. Update get_daily_candidates with distance filter and proximity sort
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
  -- Load user location
  SELECT p.location INTO user_location
    FROM profiles p
   WHERE p.id = current_user_id;

  -- Load preferences (may be NULL if none saved)
  SELECT dp.min_age, dp.max_age, dp.orientations, dp.looking_for, dp.max_distance
    INTO pref
    FROM discovery_preferences dp
   WHERE dp.user_id = current_user_id;

  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.is_profile_complete = true
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
    -- Distance filter (only when both have location AND max_distance is set)
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
