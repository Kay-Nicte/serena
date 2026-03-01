-- Add advanced filter columns to discovery_preferences
ALTER TABLE discovery_preferences
  ADD COLUMN IF NOT EXISTS smoking text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS drinking text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS children text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pets text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS zodiac text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hogwarts_house text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS min_height integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_height integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS smoking_include_unspecified boolean DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS drinking_include_unspecified boolean DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS children_include_unspecified boolean DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS pets_include_unspecified boolean DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS zodiac_include_unspecified boolean DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS hogwarts_include_unspecified boolean DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS height_include_unspecified boolean DEFAULT TRUE;

-- Recreate get_daily_candidates with advanced filters
DROP FUNCTION IF EXISTS get_daily_candidates(integer);

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
  SELECT p.location INTO user_location FROM profiles p WHERE p.id = current_user_id;
  SELECT dp.* INTO pref FROM discovery_preferences dp WHERE dp.user_id = current_user_id;

  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.name IS NOT NULL AND p.name != ''
    AND p.banned_at IS NULL
    -- Exclude already swiped today
    AND NOT EXISTS (SELECT 1 FROM daily_profiles d WHERE d.user_id = current_user_id AND d.target_id = p.id AND d.action_date = today)
    -- Exclude already matched
    AND NOT EXISTS (SELECT 1 FROM matches m WHERE (m.user_a_id = current_user_id AND m.user_b_id = p.id) OR (m.user_a_id = p.id AND m.user_b_id = current_user_id))
    -- Exclude blocked users
    AND NOT EXISTS (SELECT 1 FROM user_blocks ub WHERE (ub.blocker_id = current_user_id AND ub.blocked_id = p.id) OR (ub.blocker_id = p.id AND ub.blocked_id = current_user_id))
    -- Age filter
    AND (pref IS NULL OR p.birth_date IS NULL OR EXTRACT(YEAR FROM AGE(p.birth_date)) BETWEEN pref.min_age AND pref.max_age)
    -- Orientation filter (array overlap)
    AND (pref IS NULL OR pref.orientations IS NULL OR p.orientation && pref.orientations)
    -- Looking for filter (array overlap)
    AND (pref IS NULL OR pref.looking_for IS NULL OR p.looking_for && pref.looking_for)
    -- Distance filter
    AND (user_location IS NULL OR pref IS NULL OR pref.max_distance IS NULL OR p.location IS NULL OR ST_DWithin(user_location, p.location, pref.max_distance * 1000))
    -- Smoking filter
    AND (pref IS NULL OR pref.smoking IS NULL
         OR p.smoking = ANY(pref.smoking)
         OR (pref.smoking_include_unspecified AND p.smoking IS NULL))
    -- Drinking filter
    AND (pref IS NULL OR pref.drinking IS NULL
         OR p.drinking = ANY(pref.drinking)
         OR (pref.drinking_include_unspecified AND p.drinking IS NULL))
    -- Children filter
    AND (pref IS NULL OR pref.children IS NULL
         OR p.children = ANY(pref.children)
         OR (pref.children_include_unspecified AND p.children IS NULL))
    -- Pets filter (array overlap)
    AND (pref IS NULL OR pref.pets IS NULL
         OR p.pets && pref.pets
         OR (pref.pets_include_unspecified AND p.pets IS NULL))
    -- Zodiac filter
    AND (pref IS NULL OR pref.zodiac IS NULL
         OR p.zodiac = ANY(pref.zodiac)
         OR (pref.zodiac_include_unspecified AND p.zodiac IS NULL))
    -- Hogwarts house filter
    AND (pref IS NULL OR pref.hogwarts_house IS NULL
         OR p.hogwarts_house = ANY(pref.hogwarts_house)
         OR (pref.hogwarts_include_unspecified AND p.hogwarts_house IS NULL))
    -- Height filter (range)
    AND (pref IS NULL OR (pref.min_height IS NULL AND pref.max_height IS NULL)
         OR (p.height_cm IS NOT NULL
             AND (pref.min_height IS NULL OR p.height_cm >= pref.min_height)
             AND (pref.max_height IS NULL OR p.height_cm <= pref.max_height))
         OR (pref.height_include_unspecified AND p.height_cm IS NULL))
  ORDER BY
    CASE WHEN EXISTS (
      SELECT 1 FROM daily_profiles sl WHERE sl.user_id = p.id AND sl.target_id = current_user_id AND sl.action = 'superlike'
    ) THEN 0 ELSE 1 END,
    CASE WHEN user_location IS NOT NULL AND p.location IS NOT NULL THEN ST_Distance(user_location, p.location) ELSE random() * 1e12 END
  LIMIT candidate_limit;
END;
$$;
