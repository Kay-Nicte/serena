-- ============================================================
-- 070: Compatibility ranking based on discovery preferences vs real profiles
-- ============================================================

-- Deactivate old compatibility game questions (no longer needed)
UPDATE game_questions SET is_active = false WHERE game_type = 'compatibility';

-- RPC: Find the most compatible profile based on the user's discovery preferences
CREATE OR REPLACE FUNCTION find_most_compatible()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_pref RECORD;
  v_user_location GEOGRAPHY;
  v_result RECORD;
BEGIN
  SELECT p.location INTO v_user_location FROM profiles p WHERE p.id = v_user_id;
  SELECT dp.* INTO v_pref FROM discovery_preferences dp WHERE dp.user_id = v_user_id;

  IF v_pref IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT
    p.id AS user_id,
    p.name,
    p.avatar_url,
    p.is_verified,
    -- Score: sum of matches (COALESCE to 0 so NULLs don't poison the sum)
    COALESCE(CASE WHEN v_pref.smoking IS NOT NULL AND p.smoking IS NOT NULL
         THEN CASE WHEN p.smoking = ANY(v_pref.smoking) THEN 1.0 ELSE 0.0 END END, 0)
    + COALESCE(CASE WHEN v_pref.drinking IS NOT NULL AND p.drinking IS NOT NULL
         THEN CASE WHEN p.drinking = ANY(v_pref.drinking) THEN 1.0 ELSE 0.0 END END, 0)
    + COALESCE(CASE WHEN v_pref.children IS NOT NULL AND p.children IS NOT NULL
         THEN CASE WHEN p.children = ANY(v_pref.children) THEN 1.0 ELSE 0.0 END END, 0)
    + COALESCE(CASE WHEN v_pref.relationship_type IS NOT NULL AND p.relationship_type IS NOT NULL
         THEN CASE WHEN p.relationship_type = ANY(v_pref.relationship_type) THEN 1.0 ELSE 0.0 END END, 0)
    + COALESCE(CASE WHEN v_pref.exercise IS NOT NULL AND p.exercise IS NOT NULL
         THEN CASE WHEN p.exercise = ANY(v_pref.exercise) THEN 1.0 ELSE 0.0 END END, 0)
    + COALESCE(CASE WHEN v_pref.education IS NOT NULL AND p.education IS NOT NULL
         THEN CASE WHEN p.education = ANY(v_pref.education) THEN 1.0 ELSE 0.0 END END, 0)
    + COALESCE(CASE WHEN v_pref.religion IS NOT NULL AND p.religion IS NOT NULL
         THEN CASE WHEN p.religion = ANY(v_pref.religion) THEN 1.0 ELSE 0.0 END END, 0)
    + COALESCE(CASE WHEN v_pref.pets IS NOT NULL AND p.pets IS NOT NULL AND array_length(v_pref.pets, 1) > 0
         THEN COALESCE(array_length(ARRAY(SELECT unnest(v_pref.pets) INTERSECT SELECT unnest(p.pets)), 1), 0)::NUMERIC
              / array_length(v_pref.pets, 1) END, 0)
    + COALESCE(CASE WHEN v_pref.looking_for IS NOT NULL AND p.looking_for IS NOT NULL AND array_length(v_pref.looking_for, 1) > 0
         THEN COALESCE(array_length(ARRAY(SELECT unnest(v_pref.looking_for) INTERSECT SELECT unnest(p.looking_for)), 1), 0)::NUMERIC
              / array_length(v_pref.looking_for, 1) END, 0)
    + COALESCE(CASE WHEN v_pref.zodiac IS NOT NULL AND p.zodiac IS NOT NULL
         THEN CASE WHEN p.zodiac = ANY(v_pref.zodiac) THEN 1.0 ELSE 0.0 END END, 0)
    + COALESCE(CASE WHEN v_pref.hogwarts_house IS NOT NULL AND p.hogwarts_house IS NOT NULL
         THEN CASE WHEN p.hogwarts_house = ANY(v_pref.hogwarts_house) THEN 1.0 ELSE 0.0 END END, 0)
    AS raw_score,
    -- Count how many fields were actually compared
    (CASE WHEN v_pref.smoking IS NOT NULL AND p.smoking IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN v_pref.drinking IS NOT NULL AND p.drinking IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN v_pref.children IS NOT NULL AND p.children IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN v_pref.relationship_type IS NOT NULL AND p.relationship_type IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN v_pref.exercise IS NOT NULL AND p.exercise IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN v_pref.education IS NOT NULL AND p.education IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN v_pref.religion IS NOT NULL AND p.religion IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN v_pref.pets IS NOT NULL AND p.pets IS NOT NULL AND array_length(v_pref.pets, 1) > 0 THEN 1 ELSE 0 END)
    + (CASE WHEN v_pref.looking_for IS NOT NULL AND p.looking_for IS NOT NULL AND array_length(v_pref.looking_for, 1) > 0 THEN 1 ELSE 0 END)
    + (CASE WHEN v_pref.zodiac IS NOT NULL AND p.zodiac IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN v_pref.hogwarts_house IS NOT NULL AND p.hogwarts_house IS NOT NULL THEN 1 ELSE 0 END)
    AS compared_fields
  INTO v_result
  FROM profiles p
  WHERE p.id != v_user_id
    AND p.name IS NOT NULL AND p.name != ''
    AND p.banned_at IS NULL
    AND NOT p.is_paused
    AND p.is_verified
    AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
    -- Exclude blocked
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks ub
      WHERE (ub.blocker_id = v_user_id AND ub.blocked_id = p.id)
         OR (ub.blocker_id = p.id AND ub.blocked_id = v_user_id)
    )
    -- Basic filters (age, orientation, distance)
    AND (p.birth_date IS NULL OR EXTRACT(YEAR FROM AGE(p.birth_date)) BETWEEN v_pref.min_age AND v_pref.max_age)
    AND (v_pref.orientations IS NULL OR p.orientation && v_pref.orientations)
    AND (v_user_location IS NULL OR v_pref.max_distance IS NULL OR p.location IS NULL
         OR ST_DWithin(v_user_location, p.location, v_pref.max_distance * 1000))
  ORDER BY
    CASE
      WHEN (
        (CASE WHEN v_pref.smoking IS NOT NULL AND p.smoking IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.drinking IS NOT NULL AND p.drinking IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.children IS NOT NULL AND p.children IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.relationship_type IS NOT NULL AND p.relationship_type IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.exercise IS NOT NULL AND p.exercise IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.education IS NOT NULL AND p.education IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.religion IS NOT NULL AND p.religion IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.pets IS NOT NULL AND p.pets IS NOT NULL AND array_length(v_pref.pets, 1) > 0 THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.looking_for IS NOT NULL AND p.looking_for IS NOT NULL AND array_length(v_pref.looking_for, 1) > 0 THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.zodiac IS NOT NULL AND p.zodiac IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.hogwarts_house IS NOT NULL AND p.hogwarts_house IS NOT NULL THEN 1 ELSE 0 END)
      ) > 0
      THEN (
        COALESCE(CASE WHEN v_pref.smoking IS NOT NULL AND p.smoking IS NOT NULL THEN CASE WHEN p.smoking = ANY(v_pref.smoking) THEN 1.0 ELSE 0.0 END END, 0)
        + COALESCE(CASE WHEN v_pref.drinking IS NOT NULL AND p.drinking IS NOT NULL THEN CASE WHEN p.drinking = ANY(v_pref.drinking) THEN 1.0 ELSE 0.0 END END, 0)
        + COALESCE(CASE WHEN v_pref.children IS NOT NULL AND p.children IS NOT NULL THEN CASE WHEN p.children = ANY(v_pref.children) THEN 1.0 ELSE 0.0 END END, 0)
        + COALESCE(CASE WHEN v_pref.relationship_type IS NOT NULL AND p.relationship_type IS NOT NULL THEN CASE WHEN p.relationship_type = ANY(v_pref.relationship_type) THEN 1.0 ELSE 0.0 END END, 0)
        + COALESCE(CASE WHEN v_pref.exercise IS NOT NULL AND p.exercise IS NOT NULL THEN CASE WHEN p.exercise = ANY(v_pref.exercise) THEN 1.0 ELSE 0.0 END END, 0)
        + COALESCE(CASE WHEN v_pref.education IS NOT NULL AND p.education IS NOT NULL THEN CASE WHEN p.education = ANY(v_pref.education) THEN 1.0 ELSE 0.0 END END, 0)
        + COALESCE(CASE WHEN v_pref.religion IS NOT NULL AND p.religion IS NOT NULL THEN CASE WHEN p.religion = ANY(v_pref.religion) THEN 1.0 ELSE 0.0 END END, 0)
        + COALESCE(CASE WHEN v_pref.pets IS NOT NULL AND p.pets IS NOT NULL AND array_length(v_pref.pets, 1) > 0
             THEN COALESCE(array_length(ARRAY(SELECT unnest(v_pref.pets) INTERSECT SELECT unnest(p.pets)), 1), 0)::NUMERIC / array_length(v_pref.pets, 1) END, 0)
        + COALESCE(CASE WHEN v_pref.looking_for IS NOT NULL AND p.looking_for IS NOT NULL AND array_length(v_pref.looking_for, 1) > 0
             THEN COALESCE(array_length(ARRAY(SELECT unnest(v_pref.looking_for) INTERSECT SELECT unnest(p.looking_for)), 1), 0)::NUMERIC / array_length(v_pref.looking_for, 1) END, 0)
        + COALESCE(CASE WHEN v_pref.zodiac IS NOT NULL AND p.zodiac IS NOT NULL THEN CASE WHEN p.zodiac = ANY(v_pref.zodiac) THEN 1.0 ELSE 0.0 END END, 0)
        + COALESCE(CASE WHEN v_pref.hogwarts_house IS NOT NULL AND p.hogwarts_house IS NOT NULL THEN CASE WHEN p.hogwarts_house = ANY(v_pref.hogwarts_house) THEN 1.0 ELSE 0.0 END END, 0)
      )::NUMERIC / GREATEST((
        (CASE WHEN v_pref.smoking IS NOT NULL AND p.smoking IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.drinking IS NOT NULL AND p.drinking IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.children IS NOT NULL AND p.children IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.relationship_type IS NOT NULL AND p.relationship_type IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.exercise IS NOT NULL AND p.exercise IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.education IS NOT NULL AND p.education IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.religion IS NOT NULL AND p.religion IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.pets IS NOT NULL AND p.pets IS NOT NULL AND array_length(v_pref.pets, 1) > 0 THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.looking_for IS NOT NULL AND p.looking_for IS NOT NULL AND array_length(v_pref.looking_for, 1) > 0 THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.zodiac IS NOT NULL AND p.zodiac IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN v_pref.hogwarts_house IS NOT NULL AND p.hogwarts_house IS NOT NULL THEN 1 ELSE 0 END)
      ), 1)
      ELSE 0
    END DESC,
    -- Tiebreaker: prefer closer users
    CASE WHEN v_user_location IS NOT NULL AND p.location IS NOT NULL
         THEN ST_Distance(v_user_location, p.location) ELSE 1e12 END
  LIMIT 1;

  IF v_result IS NULL OR v_result.compared_fields < 1 THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'user_id', v_result.user_id,
    'name', v_result.name,
    'avatar_url', v_result.avatar_url,
    'is_verified', v_result.is_verified,
    'compatibility_pct', CASE WHEN v_result.compared_fields > 0
      THEN ROUND((v_result.raw_score / v_result.compared_fields) * 100)
      ELSE 0 END,
    'compared_fields', v_result.compared_fields,
    'is_match', EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user_a_id = LEAST(v_user_id, v_result.user_id) AND m.user_b_id = GREATEST(v_user_id, v_result.user_id))
    )
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
