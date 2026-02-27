-- User verification system: random gesture selfie + admin review
-- Unverified users can browse & swipe but are invisible to others.
-- Their likes are held until verification; ice breakers are blocked.

------------------------------------------------------------
-- 1. Schema changes
------------------------------------------------------------

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'none';

CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gesture TEXT NOT NULL,
  selfie_storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_id UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vr_user ON verification_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_vr_pending ON verification_requests(status) WHERE status = 'pending';

ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own verification requests"
  ON verification_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

------------------------------------------------------------
-- 2. Storage bucket for verification selfies
------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('verification-selfies', 'verification-selfies', FALSE, 5242880, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own verification selfies"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'verification-selfies' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own verification selfies"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'verification-selfies' AND (storage.foldername(name))[1] = auth.uid()::text);

------------------------------------------------------------
-- 3. New RPCs
------------------------------------------------------------

-- Random gesture selection
CREATE OR REPLACE FUNCTION get_random_gesture()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gestures TEXT[] := ARRAY[
    'peace_sign', 'thumbs_up', 'hand_on_chin', 'point_at_camera',
    'ok_sign', 'wave', 'finger_heart', 'salute'
  ];
BEGIN
  RETURN gestures[1 + floor(random() * array_length(gestures, 1))::int];
END;
$$;

-- Submit verification request
CREATE OR REPLACE FUNCTION submit_verification_request(
  selfie_path TEXT,
  gesture_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  existing_pending INT;
BEGIN
  SELECT COUNT(*) INTO existing_pending
  FROM verification_requests
  WHERE user_id = current_user_id AND status = 'pending';

  IF existing_pending > 0 THEN
    RETURN jsonb_build_object('error', 'already_pending');
  END IF;

  INSERT INTO verification_requests (user_id, gesture, selfie_storage_path, status)
  VALUES (current_user_id, gesture_code, selfie_path, 'pending');

  UPDATE profiles
  SET verification_status = 'pending'
  WHERE id = current_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Get verification status for current user
CREATE OR REPLACE FUNCTION get_verification_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  p RECORD;
  latest RECORD;
BEGIN
  SELECT is_verified, verification_status INTO p
  FROM profiles WHERE id = current_user_id;

  SELECT id, gesture, status, rejection_reason, created_at, reviewed_at
  INTO latest
  FROM verification_requests
  WHERE user_id = current_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN jsonb_build_object(
    'is_verified', COALESCE(p.is_verified, false),
    'verification_status', COALESCE(p.verification_status, 'none'),
    'latest_request', CASE WHEN latest.id IS NOT NULL THEN
      jsonb_build_object(
        'id', latest.id,
        'gesture', latest.gesture,
        'status', latest.status,
        'rejection_reason', latest.rejection_reason,
        'created_at', latest.created_at,
        'reviewed_at', latest.reviewed_at
      )
    ELSE NULL END
  );
END;
$$;

-- Admin: get pending verification requests
CREATE OR REPLACE FUNCTION admin_get_pending_verifications()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID := auth.uid();
  is_admin_user BOOLEAN;
BEGIN
  SELECT is_admin INTO is_admin_user FROM profiles WHERE id = admin_user_id;
  IF NOT COALESCE(is_admin_user, FALSE) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN (
    SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb)
    FROM (
      SELECT
        vr.id,
        vr.user_id,
        vr.gesture,
        vr.selfie_storage_path,
        vr.created_at,
        jsonb_build_object(
          'name', p.name,
          'avatar_url', p.avatar_url,
          'birth_date', p.birth_date,
          'bio', p.bio,
          'created_at', p.created_at
        ) as profile
      FROM verification_requests vr
      JOIN profiles p ON p.id = vr.user_id
      WHERE vr.status = 'pending'
      ORDER BY vr.created_at ASC
    ) r
  );
END;
$$;

-- Admin: approve or reject verification
CREATE OR REPLACE FUNCTION admin_review_verification(
  request_id UUID,
  approve BOOLEAN,
  reject_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID := auth.uid();
  req RECORD;
  is_admin_user BOOLEAN;
  mutual_target UUID;
  canonical_a UUID;
  canonical_b UUID;
  new_match_id UUID;
  matches_created INT := 0;
BEGIN
  SELECT is_admin INTO is_admin_user FROM profiles WHERE id = admin_user_id;
  IF NOT COALESCE(is_admin_user, FALSE) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO req FROM verification_requests WHERE id = request_id AND status = 'pending';
  IF req IS NULL THEN
    RETURN jsonb_build_object('error', 'request_not_found');
  END IF;

  IF approve THEN
    -- Mark request as approved
    UPDATE verification_requests
    SET status = 'approved', admin_id = admin_user_id, reviewed_at = NOW()
    WHERE id = request_id;

    -- Mark profile as verified
    UPDATE profiles
    SET is_verified = TRUE, verification_status = 'approved'
    WHERE id = req.user_id;

    -- Release held likes: find mutual likes and create matches
    FOR mutual_target IN
      SELECT dp_out.target_id
      FROM daily_profiles dp_out
      WHERE dp_out.user_id = req.user_id
        AND dp_out.action IN ('like', 'superlike')
        AND EXISTS (
          SELECT 1 FROM daily_profiles dp_in
          WHERE dp_in.user_id = dp_out.target_id
            AND dp_in.target_id = req.user_id
            AND dp_in.action IN ('like', 'superlike')
        )
        AND NOT EXISTS (
          SELECT 1 FROM matches m
          WHERE m.user_a_id = LEAST(req.user_id, dp_out.target_id)
            AND m.user_b_id = GREATEST(req.user_id, dp_out.target_id)
        )
    LOOP
      canonical_a := LEAST(req.user_id, mutual_target);
      canonical_b := GREATEST(req.user_id, mutual_target);

      INSERT INTO matches (user_a_id, user_b_id)
      VALUES (canonical_a, canonical_b)
      ON CONFLICT (user_a_id, user_b_id) DO NOTHING
      RETURNING id INTO new_match_id;

      IF new_match_id IS NOT NULL THEN
        matches_created := matches_created + 1;
      END IF;
    END LOOP;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'approved',
      'matches_created', matches_created
    );
  ELSE
    -- Reject
    UPDATE verification_requests
    SET status = 'rejected', admin_id = admin_user_id, reviewed_at = NOW(),
        rejection_reason = reject_reason
    WHERE id = request_id;

    UPDATE profiles
    SET verification_status = 'rejected'
    WHERE id = req.user_id;

    RETURN jsonb_build_object('success', true, 'action', 'rejected');
  END IF;
END;
$$;

------------------------------------------------------------
-- 4. Modified RPCs
------------------------------------------------------------

-- get_daily_candidates: only show verified users
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
  SELECT p.location INTO user_location FROM profiles p WHERE p.id = current_user_id;
  SELECT dp.min_age, dp.max_age, dp.orientations, dp.looking_for, dp.max_distance
    INTO pref FROM discovery_preferences dp WHERE dp.user_id = current_user_id;

  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.name IS NOT NULL AND p.name != ''
    AND p.banned_at IS NULL
    AND p.is_verified = TRUE
    AND NOT EXISTS (SELECT 1 FROM daily_profiles d WHERE d.user_id = current_user_id AND d.target_id = p.id AND d.action_date = today)
    AND NOT EXISTS (SELECT 1 FROM matches m WHERE (m.user_a_id = current_user_id AND m.user_b_id = p.id) OR (m.user_a_id = p.id AND m.user_b_id = current_user_id))
    AND NOT EXISTS (SELECT 1 FROM user_blocks ub WHERE (ub.blocker_id = current_user_id AND ub.blocked_id = p.id) OR (ub.blocker_id = p.id AND ub.blocked_id = current_user_id))
    AND (pref IS NULL OR p.birth_date IS NULL OR EXTRACT(YEAR FROM AGE(p.birth_date)) BETWEEN pref.min_age AND pref.max_age)
    AND (pref IS NULL OR pref.orientations IS NULL OR p.orientation && pref.orientations)
    AND (pref IS NULL OR pref.looking_for IS NULL OR p.looking_for && pref.looking_for)
    AND (user_location IS NULL OR pref IS NULL OR pref.max_distance IS NULL OR p.location IS NULL OR ST_DWithin(user_location, p.location, pref.max_distance * 1000))
  ORDER BY
    CASE WHEN EXISTS (
      SELECT 1 FROM daily_profiles sl WHERE sl.user_id = p.id AND sl.target_id = current_user_id AND sl.action = 'superlike'
    ) THEN 0 ELSE 1 END,
    CASE WHEN user_location IS NOT NULL AND p.location IS NOT NULL THEN ST_Distance(user_location, p.location) ELSE random() * 1e12 END
  LIMIT candidate_limit;
END;
$$;

-- like_profile: skip mutual check for unverified users
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
  user_is_premium BOOLEAN;
  user_is_verified BOOLEAN;
  base_limit INT;
  streak_bonus INT := 0;
  total_limit INT;
BEGIN
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot like yourself';
  END IF;

  IF are_users_blocked(current_user_id, target_user_id) THEN
    RETURN jsonb_build_object('error', 'user_blocked');
  END IF;

  SELECT COALESCE(p.is_verified, FALSE) INTO user_is_verified
  FROM profiles p WHERE p.id = current_user_id;

  user_is_premium := is_user_premium(current_user_id);
  base_limit := CASE WHEN user_is_premium THEN 10 ELSE 5 END;

  SELECT CASE
    WHEN us.current_streak >= 2 AND us.current_streak < 15 AND us.last_active_date = today
    THEN 1 ELSE 0
  END INTO streak_bonus
  FROM user_streaks us WHERE us.user_id = current_user_id;
  streak_bonus := COALESCE(streak_bonus, 0);

  total_limit := base_limit + streak_bonus;

  SELECT COUNT(*) INTO daily_count
  FROM daily_profiles
  WHERE user_id = current_user_id AND action_date = today AND action = 'like';

  IF daily_count >= total_limit THEN
    RETURN jsonb_build_object('error', 'daily_limit_reached');
  END IF;

  INSERT INTO daily_profiles (user_id, target_id, action, action_date)
  VALUES (current_user_id, target_user_id, 'like', today)
  ON CONFLICT (user_id, target_id, action_date) DO NOTHING;

  -- Held likes: skip mutual check if user is NOT verified
  IF NOT user_is_verified THEN
    RETURN jsonb_build_object('matched', false, 'held', true);
  END IF;

  -- Check mutual: other user liked OR superliked us
  SELECT EXISTS (
    SELECT 1 FROM daily_profiles
    WHERE user_id = target_user_id AND target_id = current_user_id
      AND action IN ('like', 'superlike')
  ) INTO mutual;

  IF mutual THEN
    canonical_a := LEAST(current_user_id, target_user_id);
    canonical_b := GREATEST(current_user_id, target_user_id);

    INSERT INTO matches (user_a_id, user_b_id)
    VALUES (canonical_a, canonical_b)
    ON CONFLICT (user_a_id, user_b_id) DO NOTHING
    RETURNING id INTO new_match_id;

    IF new_match_id IS NULL THEN
      SELECT id INTO new_match_id FROM matches
      WHERE user_a_id = canonical_a AND user_b_id = canonical_b;
    END IF;

    RETURN jsonb_build_object('matched', true, 'match_id', new_match_id);
  END IF;

  RETURN jsonb_build_object('matched', false);
END;
$$;

-- superlike_profile: skip mutual check + push for unverified users
CREATE OR REPLACE FUNCTION superlike_profile(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  today DATE := CURRENT_DATE;
  available INT;
  mutual BOOLEAN := FALSE;
  new_match_id UUID;
  canonical_a UUID;
  canonical_b UUID;
  target_is_premium BOOLEAN;
  sender_name TEXT;
  push_body TEXT;
  user_is_verified BOOLEAN;
BEGIN
  IF current_user_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot superlike yourself';
  END IF;

  IF are_users_blocked(current_user_id, target_user_id) THEN
    RETURN jsonb_build_object('error', 'user_blocked');
  END IF;

  SELECT available_superlikes INTO available
  FROM user_streaks WHERE user_id = current_user_id;

  IF COALESCE(available, 0) <= 0 THEN
    RETURN jsonb_build_object('error', 'no_superlikes_available');
  END IF;

  IF EXISTS (
    SELECT 1 FROM daily_profiles
    WHERE user_id = current_user_id AND target_id = target_user_id AND action_date = today
  ) THEN
    RETURN jsonb_build_object('error', 'already_swiped');
  END IF;

  INSERT INTO daily_profiles (user_id, target_id, action, action_date)
  VALUES (current_user_id, target_user_id, 'superlike', today);

  UPDATE user_streaks SET available_superlikes = available_superlikes - 1
  WHERE user_id = current_user_id;

  -- Check verification status
  SELECT COALESCE(p.is_verified, FALSE) INTO user_is_verified
  FROM profiles p WHERE p.id = current_user_id;

  -- Held likes: skip mutual check + push if NOT verified
  IF NOT user_is_verified THEN
    RETURN jsonb_build_object('matched', false, 'held', true);
  END IF;

  -- Check mutual (like or superlike from the other side)
  SELECT EXISTS (
    SELECT 1 FROM daily_profiles
    WHERE user_id = target_user_id AND target_id = current_user_id
      AND action IN ('like', 'superlike')
  ) INTO mutual;

  IF mutual THEN
    canonical_a := LEAST(current_user_id, target_user_id);
    canonical_b := GREATEST(current_user_id, target_user_id);

    INSERT INTO matches (user_a_id, user_b_id)
    VALUES (canonical_a, canonical_b)
    ON CONFLICT (user_a_id, user_b_id) DO NOTHING
    RETURNING id INTO new_match_id;

    IF new_match_id IS NULL THEN
      SELECT id INTO new_match_id FROM matches
      WHERE user_a_id = canonical_a AND user_b_id = canonical_b;
    END IF;

    RETURN jsonb_build_object('matched', true, 'match_id', new_match_id);
  END IF;

  -- Push notification (only for verified users)
  SELECT COALESCE(p.is_premium, FALSE) INTO target_is_premium
  FROM profiles p WHERE p.id = target_user_id;

  IF target_is_premium THEN
    SELECT p.name INTO sender_name FROM profiles p WHERE p.id = current_user_id;
    push_body := COALESCE(sender_name, 'Alguien') || ' te ha dado un superlike!';
  ELSE
    push_body := '¡Alguien te ha dado un superlike!';
  END IF;

  PERFORM send_push_notification(
    target_user_id,
    '⭐ Superlike!',
    push_body,
    jsonb_build_object('type', 'superlike', 'sender_id', current_user_id)
  );

  RETURN jsonb_build_object('matched', false);
END;
$$;

-- send_ice_breaker: block unverified users
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

  -- Block unverified users
  IF NOT (SELECT COALESCE(is_verified, FALSE) FROM profiles WHERE id = current_user_id) THEN
    RETURN jsonb_build_object('error', 'not_verified');
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

------------------------------------------------------------
-- 5. Migrate existing users: mark all complete profiles as verified
------------------------------------------------------------

UPDATE profiles
SET is_verified = TRUE, verification_status = 'approved'
WHERE is_profile_complete = TRUE AND banned_at IS NULL;
