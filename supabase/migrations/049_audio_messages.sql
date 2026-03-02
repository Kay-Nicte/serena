-- Audio messages: add audio_url column and chat-audio storage bucket

-- 1. Add audio_url to messages (null = no audio)
ALTER TABLE messages ADD COLUMN audio_url TEXT DEFAULT NULL;

-- 2. Chat audio storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-audio',
  'chat-audio',
  TRUE,
  10485760, -- 10MB
  ARRAY['audio/mp4', 'audio/m4a', 'audio/aac', 'audio/mpeg']
);

-- Storage policies for chat-audio bucket
CREATE POLICY "Authenticated users can view chat audio"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-audio');

CREATE POLICY "Authenticated users can upload chat audio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-audio');

-- 3. Update get_matches_with_details to return audio_url from last message
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
      json_build_object(
        'id', other_profile.id,
        'name', other_profile.name,
        'avatar_url', other_profile.avatar_url
      ) AS "otherUser",
      last_msg.content AS "lastMessage",
      last_msg.image_url AS "lastMessageImageUrl",
      last_msg.audio_url AS "lastMessageAudioUrl",
      last_msg.created_at AS "lastMessageAt",
      COALESCE(unread.count, 0)::int AS "unreadCount",
      CASE
        WHEN m.user_a_id = current_user_id THEN m.is_favorite_a
        ELSE m.is_favorite_b
      END AS "isFavorite",
      CASE
        WHEN m.user_a_id = current_user_id THEN m.is_favorite_a
        ELSE m.is_favorite_b
      END AS is_fav,
      COALESCE(last_msg.created_at, m.created_at) AS sort_date
    FROM matches m
    INNER JOIN profiles other_profile
      ON other_profile.id = CASE
        WHEN m.user_a_id = current_user_id THEN m.user_b_id
        ELSE m.user_a_id
      END
    LEFT JOIN LATERAL (
      SELECT msg.content, msg.image_url, msg.audio_url, msg.created_at, msg.sender_id
      FROM messages msg
      WHERE msg.match_id = m.id
      ORDER BY msg.created_at DESC
      LIMIT 1
    ) last_msg ON true
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

  RETURN COALESCE(result, '[]'::json);
END;
$$;
