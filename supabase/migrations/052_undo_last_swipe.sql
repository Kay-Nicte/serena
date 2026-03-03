-- Undo last swipe (premium-only)
CREATE OR REPLACE FUNCTION undo_last_swipe(target_user_id UUID, swipe_action TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_deleted BOOLEAN := FALSE;
  v_match_removed BOOLEAN := FALSE;
  v_match_id UUID;
  v_msg_count INT;
BEGIN
  -- Must be premium
  IF NOT is_user_premium(v_user_id) THEN
    RETURN jsonb_build_object('error', 'premium_required');
  END IF;

  -- Validate swipe_action
  IF swipe_action NOT IN ('like', 'superlike', 'pass') THEN
    RETURN jsonb_build_object('error', 'invalid_action');
  END IF;

  -- Delete today's swipe from daily_profiles
  DELETE FROM daily_profiles
  WHERE user_id = v_user_id
    AND target_id = target_user_id
    AND action_date = CURRENT_DATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'swipe_not_found');
  END IF;

  v_deleted := TRUE;

  -- If it was a like or superlike, check if a match was created and remove it if no messages
  IF swipe_action IN ('like', 'superlike') THEN
    SELECT id INTO v_match_id
    FROM matches
    WHERE user_a_id = LEAST(v_user_id, target_user_id)
      AND user_b_id = GREATEST(v_user_id, target_user_id);

    IF v_match_id IS NOT NULL THEN
      SELECT COUNT(*) INTO v_msg_count
      FROM messages
      WHERE match_id = v_match_id;

      IF v_msg_count = 0 THEN
        DELETE FROM matches WHERE id = v_match_id;
        v_match_removed := TRUE;
      END IF;
    END IF;
  END IF;

  -- If it was a superlike, restore the superlike count
  IF swipe_action = 'superlike' THEN
    UPDATE user_streaks
    SET available_superlikes = available_superlikes + 1
    WHERE user_id = v_user_id;
  END IF;

  RETURN jsonb_build_object('success', v_deleted, 'match_removed', v_match_removed);
END;
$$;
