-- RPC: unmatch_user
-- Atomic function that removes a match and its messages.
-- Verifies the calling user is part of the match.
-- Uses SECURITY DEFINER to bypass RLS for deletion.

CREATE OR REPLACE FUNCTION unmatch_user(target_match_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  match_record RECORD;
BEGIN
  -- Fetch the match and verify current user is part of it
  SELECT id, user_a_id, user_b_id
  INTO match_record
  FROM matches
  WHERE id = target_match_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found';
  END IF;

  IF match_record.user_a_id != current_user_id
     AND match_record.user_b_id != current_user_id THEN
    RAISE EXCEPTION 'Not authorized to unmatch';
  END IF;

  -- Delete messages for this match (cascade would handle this,
  -- but being explicit for clarity)
  DELETE FROM messages WHERE match_id = target_match_id;

  -- Delete the match row
  DELETE FROM matches WHERE id = target_match_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
