-- Allow admins to read all messages (for moderation)
CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow admins to read all matches (to find conversations)
CREATE POLICY "Admins can view all matches"
  ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
