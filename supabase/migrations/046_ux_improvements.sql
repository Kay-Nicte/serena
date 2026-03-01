-- 046_ux_improvements.sql
-- F1: Update get_matches_with_details to include is_verified
-- F4: Profile prompts table
-- F6: Match nudges table + notify_stale_matches function
-- F7: RPC get_pending_likes

-- ============================================================
-- F1: Update get_matches_with_details to include is_verified
-- ============================================================
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
      json_build_object(
        'id', other_profile.id,
        'name', other_profile.name,
        'avatar_url', other_profile.avatar_url,
        'is_verified', other_profile.is_verified
      ) AS "otherUser",
      last_msg.content AS "lastMessage",
      last_msg.image_url AS "lastMessageImageUrl",
      last_msg.created_at AS "lastMessageAt",
      COALESCE(unread.count, 0)::int AS "unreadCount",
      COALESCE(last_msg.created_at, m.created_at) AS sort_date
    FROM matches m
    INNER JOIN profiles other_profile
      ON other_profile.id = CASE
        WHEN m.user_a_id = current_user_id THEN m.user_b_id
        ELSE m.user_a_id
      END
    LEFT JOIN LATERAL (
      SELECT msg.content, msg.image_url, msg.created_at, msg.sender_id
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

-- ============================================================
-- F4: Profile prompts table
-- ============================================================
CREATE TABLE IF NOT EXISTS profile_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_key TEXT NOT NULL,
  answer TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, position)
);

-- RLS
ALTER TABLE profile_prompts ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read prompts
CREATE POLICY "Authenticated users can read all prompts"
  ON profile_prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own prompts
CREATE POLICY "Users can insert own prompts"
  ON profile_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own prompts
CREATE POLICY "Users can update own prompts"
  ON profile_prompts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own prompts
CREATE POLICY "Users can delete own prompts"
  ON profile_prompts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- F6: Match nudges table + notify function
-- ============================================================
CREATE TABLE IF NOT EXISTS match_nudges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_match_nudges_match_id ON match_nudges(match_id);
CREATE INDEX IF NOT EXISTS idx_match_nudges_sent_at ON match_nudges(sent_at);

ALTER TABLE match_nudges ENABLE ROW LEVEL SECURITY;

-- Only server-side (service role) can manage nudges
CREATE POLICY "Service role manages nudges"
  ON match_nudges
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to find stale matches (last message > 3 days ago, no nudge in 7 days)
-- This can be called by pg_cron or an Edge Function
CREATE OR REPLACE FUNCTION notify_stale_matches()
RETURNS TABLE(match_id UUID, user_a_id UUID, user_b_id UUID, user_a_name TEXT, user_b_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id AS match_id,
    m.user_a_id,
    m.user_b_id,
    pa.name AS user_a_name,
    pb.name AS user_b_name
  FROM matches m
  INNER JOIN profiles pa ON pa.id = m.user_a_id
  INNER JOIN profiles pb ON pb.id = m.user_b_id
  WHERE (
    -- Last message is older than 3 days
    SELECT MAX(msg.created_at)
    FROM messages msg
    WHERE msg.match_id = m.id
  ) < NOW() - INTERVAL '3 days'
  AND NOT EXISTS (
    -- No nudge sent in the last 7 days
    SELECT 1 FROM match_nudges mn
    WHERE mn.match_id = m.id
      AND mn.sent_at > NOW() - INTERVAL '7 days'
  );
END;
$$;

-- ============================================================
-- F7: RPC get_pending_likes
-- ============================================================
CREATE OR REPLACE FUNCTION get_pending_likes()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  result JSON;
BEGIN
  SELECT json_agg(row_data)
  INTO result
  FROM (
    SELECT
      p.id,
      p.name,
      p.avatar_url,
      p.is_verified,
      dp.action
    FROM daily_profiles dp
    INNER JOIN profiles p ON p.id = dp.user_id
    WHERE dp.target_id = current_user_id
      AND dp.action IN ('like', 'superlike')
      -- Not already matched
      AND NOT EXISTS (
        SELECT 1 FROM matches m
        WHERE (m.user_a_id = current_user_id AND m.user_b_id = dp.user_id)
           OR (m.user_a_id = dp.user_id AND m.user_b_id = current_user_id)
      )
      -- Current user hasn't acted on this profile yet
      AND NOT EXISTS (
        SELECT 1 FROM daily_profiles d2
        WHERE d2.user_id = current_user_id
          AND d2.target_id = dp.user_id
      )
    ORDER BY dp.created_at DESC
  ) row_data;

  RETURN COALESCE(result, '[]'::json);
END;
$$;
