-- Discovery preferences: age range, orientation, and looking_for filters.

CREATE TABLE discovery_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  min_age INTEGER NOT NULL DEFAULT 18,
  max_age INTEGER NOT NULL DEFAULT 99,
  orientations TEXT[] DEFAULT NULL,
  looking_for TEXT[] DEFAULT NULL
);

ALTER TABLE discovery_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON discovery_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON discovery_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON discovery_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Update get_daily_candidates to apply discovery preference filters.

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
BEGIN
  -- Load preferences (may be NULL if none saved)
  SELECT dp.min_age, dp.max_age, dp.orientations, dp.looking_for
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
    -- Age filter (only when preferences exist and birth_date is set)
    AND (
      pref IS NULL
      OR p.birth_date IS NULL
      OR EXTRACT(YEAR FROM AGE(p.birth_date)) BETWEEN pref.min_age AND pref.max_age
    )
    -- Orientation filter (only when preferences exist and orientations array is set)
    AND (
      pref IS NULL
      OR pref.orientations IS NULL
      OR p.orientation::text = ANY(pref.orientations)
    )
    -- Looking-for filter (only when preferences exist and looking_for array is set)
    AND (
      pref IS NULL
      OR pref.looking_for IS NULL
      OR p.looking_for::text = ANY(pref.looking_for)
    )
  ORDER BY random()
  LIMIT candidate_limit;
END;
$$;
