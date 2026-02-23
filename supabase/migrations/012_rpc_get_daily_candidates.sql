-- RPC: get_daily_candidates
-- Returns candidate profiles excluding: self, already swiped today, already matched.
-- Random order, configurable limit.

CREATE OR REPLACE FUNCTION get_daily_candidates(candidate_limit INT DEFAULT 10)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
BEGIN
  RETURN QUERY
  SELECT p.*
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
  ORDER BY random()
  LIMIT candidate_limit;
END;
$$;
