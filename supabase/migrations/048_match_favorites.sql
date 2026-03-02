-- Add favorite columns to matches (one per side of the canonical pair)
ALTER TABLE matches
  ADD COLUMN is_favorite_a BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN is_favorite_b BOOLEAN NOT NULL DEFAULT false;

-- UPDATE RLS policy for matches (was missing)
CREATE POLICY "Users can update own match favorites"
  ON matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id)
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- RPC: toggle favorite status for a match
CREATE OR REPLACE FUNCTION toggle_match_favorite(target_match_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  is_a BOOLEAN;
  new_value BOOLEAN;
BEGIN
  -- Determine if caller is user_a or user_b
  SELECT (user_a_id = current_user_id)
  INTO is_a
  FROM matches
  WHERE id = target_match_id
    AND (user_a_id = current_user_id OR user_b_id = current_user_id);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found or access denied';
  END IF;

  IF is_a THEN
    UPDATE matches
    SET is_favorite_a = NOT is_favorite_a
    WHERE id = target_match_id
    RETURNING is_favorite_a INTO new_value;
  ELSE
    UPDATE matches
    SET is_favorite_b = NOT is_favorite_b
    WHERE id = target_match_id
    RETURNING is_favorite_b INTO new_value;
  END IF;

  RETURN new_value;
END;
$$;

-- Update get_matches_with_details to include favorite status and sort favorites first
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
  SELECT json_agg(row_data ORDER BY is_fav DESC, sort_date DESC)
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
      -- Favorite status for the current user
      CASE
        WHEN m.user_a_id = current_user_id THEN m.is_favorite_a
        ELSE m.is_favorite_b
      END AS "isFavorite",
      -- Sort keys
      CASE
        WHEN m.user_a_id = current_user_id THEN m.is_favorite_a
        ELSE m.is_favorite_b
      END AS is_fav,
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
