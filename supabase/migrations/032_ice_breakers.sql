-- Ice Breakers: allow users to send a message before matching
CREATE TYPE ice_breaker_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE ice_breakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
  status ice_breaker_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sender_id, recipient_id)
);

CREATE INDEX idx_ice_breakers_recipient ON ice_breakers(recipient_id, status);
ALTER TABLE ice_breakers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sent ice breakers" ON ice_breakers FOR SELECT TO authenticated USING (auth.uid() = sender_id);
CREATE POLICY "Users can view received ice breakers" ON ice_breakers FOR SELECT TO authenticated USING (auth.uid() = recipient_id);

-- RPC: send ice breaker
CREATE OR REPLACE FUNCTION send_ice_breaker(target_user_id UUID, ice_breaker_message TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  available INT;
BEGIN
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot send ice breaker to yourself';
  END IF;

  SELECT available_ice_breakers INTO available FROM user_streaks WHERE user_id = current_user_id;
  IF COALESCE(available, 0) <= 0 THEN
    RETURN jsonb_build_object('error', 'no_ice_breakers_available');
  END IF;

  IF EXISTS (SELECT 1 FROM matches m WHERE (m.user_a_id = current_user_id AND m.user_b_id = target_user_id) OR (m.user_a_id = target_user_id AND m.user_b_id = current_user_id)) THEN
    RETURN jsonb_build_object('error', 'already_matched');
  END IF;

  IF EXISTS (SELECT 1 FROM user_blocks WHERE (blocker_id = current_user_id AND blocked_id = target_user_id) OR (blocker_id = target_user_id AND blocked_id = current_user_id)) THEN
    RETURN jsonb_build_object('error', 'blocked');
  END IF;

  INSERT INTO ice_breakers (sender_id, recipient_id, message)
  VALUES (current_user_id, target_user_id, ice_breaker_message)
  ON CONFLICT (sender_id, recipient_id) DO NOTHING;

  UPDATE user_streaks SET available_ice_breakers = available_ice_breakers - 1 WHERE user_id = current_user_id;

  PERFORM send_push_notification(target_user_id, 'Ice Breaker!', 'Someone sent you a message!', jsonb_build_object('type', 'ice_breaker', 'sender_id', current_user_id));

  RETURN jsonb_build_object('success', true);
END;
$$;

-- RPC: respond to ice breaker (accept creates match + first message)
CREATE OR REPLACE FUNCTION respond_to_ice_breaker(target_ice_breaker_id UUID, accept BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  ib RECORD;
  new_match_id UUID;
  canonical_a UUID;
  canonical_b UUID;
BEGIN
  SELECT * INTO ib FROM ice_breakers WHERE id = target_ice_breaker_id AND recipient_id = current_user_id AND status = 'pending';
  IF ib IS NULL THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  IF NOT accept THEN
    UPDATE ice_breakers SET status = 'declined' WHERE id = target_ice_breaker_id;
    RETURN jsonb_build_object('success', true, 'action', 'declined');
  END IF;

  UPDATE ice_breakers SET status = 'accepted' WHERE id = target_ice_breaker_id;

  canonical_a := LEAST(ib.sender_id, ib.recipient_id);
  canonical_b := GREATEST(ib.sender_id, ib.recipient_id);

  INSERT INTO matches (user_a_id, user_b_id) VALUES (canonical_a, canonical_b)
  ON CONFLICT (user_a_id, user_b_id) DO NOTHING
  RETURNING id INTO new_match_id;

  IF new_match_id IS NULL THEN
    SELECT id INTO new_match_id FROM matches WHERE user_a_id = canonical_a AND user_b_id = canonical_b;
  END IF;

  INSERT INTO messages (match_id, sender_id, content) VALUES (new_match_id, ib.sender_id, ib.message);

  PERFORM send_push_notification(ib.sender_id, 'Ice breaker accepted!', 'Start chatting now!', jsonb_build_object('type', 'ice_breaker_accepted', 'match_id', new_match_id));

  RETURN jsonb_build_object('success', true, 'action', 'accepted', 'match_id', new_match_id);
END;
$$;

-- RPC: get pending ice breakers for current user
CREATE OR REPLACE FUNCTION get_pending_ice_breakers()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb)
    FROM (
      SELECT ib.id, ib.message, ib.created_at,
             jsonb_build_object(
               'id', p.id, 'name', p.name, 'avatar_url', p.avatar_url,
               'bio', p.bio, 'birth_date', p.birth_date
             ) as sender
      FROM ice_breakers ib
      JOIN profiles p ON p.id = ib.sender_id
      WHERE ib.recipient_id = current_user_id AND ib.status = 'pending'
      ORDER BY ib.created_at DESC
    ) r
  );
END;
$$;
