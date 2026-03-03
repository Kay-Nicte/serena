-- Message reactions: iMessage-style reactions on chat messages

-- 1. Table
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (message_id, user_id)
);

CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);

-- 2. RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions in own matches"
  ON message_reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN matches ON matches.id = messages.match_id
      WHERE messages.id = message_reactions.message_id
      AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert own reactions"
  ON message_reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM messages
      JOIN matches ON matches.id = messages.match_id
      WHERE messages.id = message_reactions.message_id
      AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own reactions"
  ON message_reactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON message_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;

-- 4. Toggle reaction RPC
CREATE OR REPLACE FUNCTION toggle_reaction(target_message_id UUID, reaction_type TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  existing_reaction TEXT;
  result JSON;
BEGIN
  -- Validate user is participant in the match that owns this message
  IF NOT EXISTS (
    SELECT 1 FROM messages
    JOIN matches ON matches.id = messages.match_id
    WHERE messages.id = target_message_id
    AND (matches.user_a_id = current_user_id OR matches.user_b_id = current_user_id)
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Validate reaction type
  IF reaction_type NOT IN ('heart', 'thumbs-up', 'happy', 'flame', 'sparkles', 'sad') THEN
    RAISE EXCEPTION 'Invalid reaction type';
  END IF;

  -- Check for existing reaction
  SELECT reaction INTO existing_reaction
  FROM message_reactions
  WHERE message_id = target_message_id AND user_id = current_user_id;

  IF existing_reaction IS NULL THEN
    -- No existing reaction: insert
    INSERT INTO message_reactions (message_id, user_id, reaction)
    VALUES (target_message_id, current_user_id, reaction_type);
    result := json_build_object('reaction', reaction_type);
  ELSIF existing_reaction = reaction_type THEN
    -- Same reaction: remove (toggle off)
    DELETE FROM message_reactions
    WHERE message_id = target_message_id AND user_id = current_user_id;
    result := json_build_object('reaction', NULL);
  ELSE
    -- Different reaction: update
    UPDATE message_reactions
    SET reaction = reaction_type, created_at = NOW()
    WHERE message_id = target_message_id AND user_id = current_user_id;
    result := json_build_object('reaction', reaction_type);
  END IF;

  RETURN result;
END;
$$;
