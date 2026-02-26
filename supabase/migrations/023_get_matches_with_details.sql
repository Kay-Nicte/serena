-- RPC: get_matches_with_details
-- Returns all matches for the current user with:
-- - other user's profile (id, name, avatar_url)
-- - last message (content, created_at, sender_id)
-- - unread message count
-- All in a single query using JOINs and subqueries, avoiding N+1 queries.

CREATE OR REPLACE FUNCTION get_matches_with_details()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  result JSON;
BEGIN
  SELECT json_agg(row_data ORDER BY sort_date DESC)
  INTO result
  FROM (
    SELECT
      m.id,
      m.created_at,
      -- Other user's profile as a JSON object
      json_build_object(
        'id', other_profile.id,
        'name', other_profile.name,
        'avatar_url', other_profile.avatar_url
      ) AS "otherUser",
      -- Last message content
      last_msg.content AS "lastMessage",
      -- Last message image URL
      last_msg.image_url AS "lastMessageImageUrl",
      -- Last message timestamp
      last_msg.created_at AS "lastMessageAt",
      -- Unread count (messages not from current user with no read_at)
      COALESCE(unread.count, 0)::int AS "unreadCount",
      -- Sort key: last message time or match creation time
      COALESCE(last_msg.created_at, m.created_at) AS sort_date
    FROM matches m
    -- Join the other user's profile
    INNER JOIN profiles other_profile
      ON other_profile.id = CASE
        WHEN m.user_a_id = current_user_id THEN m.user_b_id
        ELSE m.user_a_id
      END
    -- Lateral join for the last message (at most 1 row)
    LEFT JOIN LATERAL (
      SELECT msg.content, msg.image_url, msg.created_at, msg.sender_id
      FROM messages msg
      WHERE msg.match_id = m.id
      ORDER BY msg.created_at DESC
      LIMIT 1
    ) last_msg ON true
    -- Lateral join for unread count
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS count
      FROM messages msg
      WHERE msg.match_id = m.id
        AND msg.sender_id != current_user_id
        AND msg.read_at IS NULL
    ) unread ON true
    WHERE m.user_a_id = current_user_id
       OR m.user_b_id = current_user_id
  ) row_data;

  -- Return empty array instead of null when no matches
  RETURN COALESCE(result, '[]'::json);
END;
$$;
