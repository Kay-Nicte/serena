-- ============================================================
-- 067: Community Groups
-- ============================================================

-- Groups table (predefined by admin)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members (many-to-many)
CREATE TABLE IF NOT EXISTS group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Authenticated can read group_members" ON group_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can join groups" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- Trigger to maintain member_count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_verified BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT is_verified INTO v_verified FROM profiles WHERE id = NEW.user_id;
    IF v_verified THEN
      UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT is_verified INTO v_verified FROM profiles WHERE id = OLD.user_id;
    IF v_verified THEN
      UPDATE groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_group_member_count
AFTER INSERT OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- RPC: Get all groups with is_member flag
CREATE OR REPLACE FUNCTION get_groups()
RETURNS TABLE (
  id UUID,
  slug TEXT,
  icon TEXT,
  color TEXT,
  member_count INTEGER,
  is_member BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    g.id,
    g.slug,
    g.icon,
    g.color,
    g.member_count,
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
    ) AS is_member
  FROM groups g
  WHERE g.is_active = TRUE
  ORDER BY g.member_count DESC;
$$;

-- RPC: Get group members with profile info
CREATE OR REPLACE FUNCTION get_group_members(p_group_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  avatar_url TEXT,
  age INTEGER,
  hometown TEXT,
  is_verified BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.name,
    p.avatar_url,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date))::INTEGER AS age,
    p.hometown,
    p.is_verified
  FROM group_members gm
  JOIN profiles p ON p.id = gm.user_id
  WHERE gm.group_id = p_group_id
    AND p.is_verified = TRUE
  ORDER BY gm.joined_at DESC;
$$;

-- Seed predefined groups
INSERT INTO groups (slug, icon, color) VALUES
  ('senderismo', '🥾', '#4CAF50'),
  ('gamers', '🎮', '#9C27B0'),
  ('mascotas', '🐾', '#FF9800'),
  ('viajeras', '✈️', '#2196F3'),
  ('foodies', '🍕', '#F44336'),
  ('lectoras', '📚', '#795548'),
  ('musica', '🎵', '#E91E63'),
  ('arte', '🎨', '#FF5722'),
  ('fitness', '💪', '#00BCD4'),
  ('peliculas', '🎬', '#673AB7'),
  ('yoga', '🧘', '#8BC34A'),
  ('fotografia', '📷', '#607D8B')
ON CONFLICT (slug) DO NOTHING;
