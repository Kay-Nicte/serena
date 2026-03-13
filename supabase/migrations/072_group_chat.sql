-- ============================================================
-- 072: Group Chat
-- ============================================================

-- Group messages table
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender ON group_messages(sender_id);

-- RLS
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Members can read messages from their groups
CREATE POLICY "Members can read group messages" ON group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    )
  );

-- Members can send messages to their groups
CREATE POLICY "Members can send group messages" ON group_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    )
  );

-- Enable realtime for group_messages
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;

NOTIFY pgrst, 'reload schema';
