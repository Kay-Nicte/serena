-- Chat improvements: image messages, user presence, chat-images storage

-- 1. Add image_url to messages (null = text-only message)
ALTER TABLE messages ADD COLUMN image_url TEXT DEFAULT NULL;

-- Allow empty content when image is present
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;

-- 2. User presence table (typing indicator + online status)
CREATE TABLE user_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  typing_in_match UUID DEFAULT NULL
);

ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Everyone can read presence (needed to see online status / typing)
CREATE POLICY "Presence is viewable by authenticated users"
  ON user_presence FOR SELECT
  TO authenticated
  USING (true);

-- Users can only upsert their own presence
CREATE POLICY "Users can insert own presence"
  ON user_presence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence"
  ON user_presence FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for user_presence
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- 3. Chat images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage policies for chat-images bucket
CREATE POLICY "Authenticated users can view chat images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-images');

CREATE POLICY "Authenticated users can upload chat images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-images');
