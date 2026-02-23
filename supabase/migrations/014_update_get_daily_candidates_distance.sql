-- Update get_daily_candidates to support distance filtering and ordering.
-- When user_lat/user_lng are provided, filters by max_distance_km and orders by proximity.
-- When not provided, falls back to random order (original behavior).

CREATE OR REPLACE FUNCTION get_daily_candidates(
  candidate_limit INT DEFAULT 10,
  user_lat DOUBLE PRECISION DEFAULT NULL,
  user_lng DOUBLE PRECISION DEFAULT NULL,
  max_distance_km INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  birth_date DATE,
  bio TEXT,
  orientation orientation,
  looking_for looking_for,
  avatar_url TEXT,
  location GEOGRAPHY(Point, 4326),
  is_profile_complete BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  user_location GEOGRAPHY;
BEGIN
  -- Build user's location point if coordinates provided
  IF user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
    user_location := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.name, p.birth_date, p.bio, p.orientation, p.looking_for,
    p.avatar_url, p.location, p.is_profile_complete, p.created_at, p.updated_at,
    CASE
      WHEN user_location IS NOT NULL AND p.location IS NOT NULL
        THEN ROUND((ST_Distance(p.location, user_location) / 1000.0)::numeric, 1)::double precision
      ELSE NULL
    END AS distance_km
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.is_profile_complete = true
    -- Exclude already swiped today
    AND NOT EXISTS (
      SELECT 1 FROM daily_profiles dp
      WHERE dp.user_id = current_user_id
        AND dp.target_id = p.id
        AND dp.action_date = today
    )
    -- Exclude already matched
    AND NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user_a_id = current_user_id AND m.user_b_id = p.id)
         OR (m.user_a_id = p.id AND m.user_b_id = current_user_id)
    )
    -- Distance filter (only when both have location)
    AND (
      user_location IS NULL
      OR p.location IS NULL
      OR ST_DWithin(p.location, user_location, max_distance_km * 1000)
    )
  ORDER BY
    CASE
      WHEN user_location IS NOT NULL AND p.location IS NOT NULL
        THEN ST_Distance(p.location, user_location)
      ELSE random()
    END
  LIMIT candidate_limit;
END;
$$;
