-- Relax get_daily_candidates: instead of requiring is_profile_complete = true,
-- only require that the profile has a name. This allows profiles created
-- directly in the DB (or with partial info) to appear in discovery.

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
    AND p.name IS NOT NULL AND p.name != ''
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
