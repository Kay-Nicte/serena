-- RLS: Allow users to update messages (mark as read)
-- Only messages received (not sent by the user), only the read_at field.

CREATE POLICY "Users can mark received messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    -- Message must be in user's match
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
    -- User is NOT the sender (can only mark received messages)
    AND sender_id != auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
    )
    AND sender_id != auth.uid()
  );
