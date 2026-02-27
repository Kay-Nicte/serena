-- =============================================================
-- User Blocks: tabla, RLS, helpers, RPCs y actualización de
-- get_daily_candidates / like_profile / triggers de push
-- =============================================================

-- 1. Tabla user_blocks
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_blocks_no_self CHECK (blocker_id != blocked_id),
  UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);

-- 2. RLS
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks"
  ON user_blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks"
  ON user_blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- 3. Helper: comprobar bloqueo bidireccional
CREATE OR REPLACE FUNCTION are_users_blocked(user1 UUID, user2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = user1 AND blocked_id = user2)
       OR (blocker_id = user2 AND blocked_id = user1)
  );
$$;

-- 4. RPC: block_user
CREATE OR REPLACE FUNCTION block_user(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot block yourself';
  END IF;

  INSERT INTO user_blocks (blocker_id, blocked_id)
  VALUES (current_user_id, target_user_id)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 5. RPC: unblock_user
CREATE OR REPLACE FUNCTION unblock_user(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  DELETE FROM user_blocks
  WHERE blocker_id = current_user_id
    AND blocked_id = target_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 6. Actualizar get_daily_candidates con filtro de bloqueos
CREATE OR REPLACE FUNCTION get_daily_candidates(candidate_limit INT DEFAULT 10)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  pref RECORD;
  user_location GEOGRAPHY;
BEGIN
  -- Load user location
  SELECT p.location INTO user_location
    FROM profiles p
   WHERE p.id = current_user_id;

  -- Load preferences (may be NULL if none saved)
  SELECT dp.min_age, dp.max_age, dp.orientations, dp.looking_for, dp.max_distance
    INTO pref
    FROM discovery_preferences dp
   WHERE dp.user_id = current_user_id;

  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.is_profile_complete = true
    -- Exclude already swiped today
    AND NOT EXISTS (
      SELECT 1 FROM daily_profiles d
      WHERE d.user_id = current_user_id
        AND d.target_id = p.id
        AND d.action_date = today
    )
    -- Exclude already matched
    AND NOT EXISTS (
      SELECT 1 FROM matches m
      WHERE (m.user_a_id = current_user_id AND m.user_b_id = p.id)
         OR (m.user_a_id = p.id AND m.user_b_id = current_user_id)
    )
    -- Exclude blocked users (both directions)
    AND NOT EXISTS (
      SELECT 1 FROM user_blocks ub
      WHERE (ub.blocker_id = current_user_id AND ub.blocked_id = p.id)
         OR (ub.blocker_id = p.id AND ub.blocked_id = current_user_id)
    )
    -- Age filter
    AND (
      pref IS NULL
      OR p.birth_date IS NULL
      OR EXTRACT(YEAR FROM AGE(p.birth_date)) BETWEEN pref.min_age AND pref.max_age
    )
    -- Orientation filter
    AND (
      pref IS NULL
      OR pref.orientations IS NULL
      OR p.orientation::text = ANY(pref.orientations)
    )
    -- Looking-for filter
    AND (
      pref IS NULL
      OR pref.looking_for IS NULL
      OR p.looking_for::text = ANY(pref.looking_for)
    )
    -- Distance filter
    AND (
      user_location IS NULL
      OR pref IS NULL
      OR pref.max_distance IS NULL
      OR p.location IS NULL
      OR ST_DWithin(user_location, p.location, pref.max_distance * 1000)
    )
  ORDER BY
    CASE
      WHEN user_location IS NOT NULL AND p.location IS NOT NULL
      THEN ST_Distance(user_location, p.location)
      ELSE random() * 1e12
    END
  LIMIT candidate_limit;
END;
$$;

-- 7. Actualizar like_profile con check de bloqueo
CREATE OR REPLACE FUNCTION like_profile(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  daily_count INT;
  mutual BOOLEAN := FALSE;
  new_match_id UUID;
  canonical_a UUID;
  canonical_b UUID;
BEGIN
  -- Validate not liking self
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot like yourself';
  END IF;

  -- Check for blocks
  IF are_users_blocked(current_user_id, target_user_id) THEN
    RETURN jsonb_build_object('error', 'user_blocked');
  END IF;

  -- Check daily limit (likes only)
  SELECT COUNT(*) INTO daily_count
  FROM daily_profiles
  WHERE user_id = current_user_id
    AND action_date = today
    AND action = 'like';

  IF daily_count >= 10 THEN
    RETURN jsonb_build_object('error', 'daily_limit_reached');
  END IF;

  -- Insert the like action
  INSERT INTO daily_profiles (user_id, target_id, action, action_date)
  VALUES (current_user_id, target_user_id, 'like', today)
  ON CONFLICT (user_id, target_id, action_date) DO NOTHING;

  -- Check if the other user has already liked us (any day)
  SELECT EXISTS (
    SELECT 1 FROM daily_profiles
    WHERE user_id = target_user_id
      AND target_id = current_user_id
      AND action = 'like'
  ) INTO mutual;

  -- If mutual like, create match
  IF mutual THEN
    IF current_user_id < target_user_id THEN
      canonical_a := current_user_id;
      canonical_b := target_user_id;
    ELSE
      canonical_a := target_user_id;
      canonical_b := current_user_id;
    END IF;

    INSERT INTO matches (user_a_id, user_b_id)
    VALUES (canonical_a, canonical_b)
    ON CONFLICT (user_a_id, user_b_id) DO NOTHING
    RETURNING id INTO new_match_id;

    IF new_match_id IS NULL THEN
      SELECT id INTO new_match_id
      FROM matches
      WHERE user_a_id = canonical_a AND user_b_id = canonical_b;
    END IF;

    RETURN jsonb_build_object(
      'matched', true,
      'match_id', new_match_id
    );
  END IF;

  RETURN jsonb_build_object('matched', false);
END;
$$;

-- 8. Actualizar trigger de nuevo match con check de bloqueo
CREATE OR REPLACE FUNCTION public.notify_new_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_name_a text;
  v_name_b text;
BEGIN
  -- Skip if users are blocked
  IF are_users_blocked(NEW.user_a_id, NEW.user_b_id) THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_name_a FROM public.profiles WHERE id = NEW.user_a_id;
  SELECT name INTO v_name_b FROM public.profiles WHERE id = NEW.user_b_id;

  PERFORM public.send_push_notification(
    NEW.user_a_id,
    'Serenade',
    COALESCE(v_name_b, 'Alguien') || ' y tu sois match! ',
    jsonb_build_object('type', 'new_match', 'match_id', NEW.id)
  );

  PERFORM public.send_push_notification(
    NEW.user_b_id,
    'Serenade',
    COALESCE(v_name_a, 'Alguien') || ' y tu sois match! ',
    jsonb_build_object('type', 'new_match', 'match_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

-- 9. Actualizar trigger de nuevo mensaje con check de bloqueo
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recipient_id uuid;
  v_sender_name text;
  v_preview text;
  v_user_a_id uuid;
  v_user_b_id uuid;
BEGIN
  SELECT user_a_id, user_b_id
  INTO v_user_a_id, v_user_b_id
  FROM public.matches
  WHERE id = NEW.match_id;

  IF NEW.sender_id = v_user_a_id THEN
    v_recipient_id := v_user_b_id;
  ELSE
    v_recipient_id := v_user_a_id;
  END IF;

  -- Skip if users are blocked
  IF are_users_blocked(NEW.sender_id, v_recipient_id) THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

  v_preview := LEFT(NEW.content, 100);
  IF LENGTH(NEW.content) > 100 THEN
    v_preview := v_preview || '...';
  END IF;

  PERFORM public.send_push_notification(
    v_recipient_id,
    COALESCE(v_sender_name, 'Nuevo mensaje'),
    v_preview,
    jsonb_build_object(
      'type', 'new_message',
      'match_id', NEW.match_id,
      'message_id', NEW.id
    )
  );

  RETURN NEW;
END;
$$;
