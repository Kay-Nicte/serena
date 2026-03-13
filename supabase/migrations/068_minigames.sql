-- ============================================================
-- 068: Minigames (3 modes: Trivia, Compatibility, Would You Rather)
-- ============================================================

-- Game questions (admin-seeded, multilingual) — shared by all modes
CREATE TABLE IF NOT EXISTS game_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL CHECK (game_type IN ('would_you_rather', 'trivia', 'compatibility')),
  question JSONB NOT NULL,   -- {"es": "...", "en": "...", ...}
  option_a JSONB,            -- {"es": "...", "en": "..."}
  option_b JSONB,            -- {"es": "...", "en": "..."}
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIVIA: Play with an existing match
-- ============================================================
CREATE TABLE IF NOT EXISTS trivia_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_ids UUID[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);
CREATE INDEX IF NOT EXISTS idx_trivia_sessions_invitee ON trivia_sessions(invitee_id, status);
CREATE INDEX IF NOT EXISTS idx_trivia_sessions_inviter ON trivia_sessions(inviter_id);

CREATE TABLE IF NOT EXISTS trivia_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES trivia_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES game_questions(id),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, question_id, user_id)
);

-- ============================================================
-- COMPATIBILITY: Discover compatible people
-- ============================================================
CREATE TABLE IF NOT EXISTS compatibility_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES game_questions(id),
  answer TEXT NOT NULL CHECK (answer IN ('a', 'b')),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_compat_answers_user ON compatibility_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_compat_answers_question ON compatibility_answers(question_id, answer);

-- ============================================================
-- WOULD YOU RATHER: Daily poll
-- ============================================================
CREATE TABLE IF NOT EXISTS wyr_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES game_questions(id),
  answer TEXT NOT NULL CHECK (answer IN ('a', 'b')),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_wyr_answers_question ON wyr_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_wyr_answers_user ON wyr_answers(user_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wyr_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions" ON game_questions FOR SELECT USING (true);

CREATE POLICY "Players see own trivia sessions" ON trivia_sessions FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "Auth users insert trivia sessions" ON trivia_sessions FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "Players update own trivia sessions" ON trivia_sessions FOR UPDATE
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Players see trivia answers" ON trivia_answers FOR SELECT
  USING (session_id IN (
    SELECT id FROM trivia_sessions WHERE inviter_id = auth.uid() OR invitee_id = auth.uid()
  ));
CREATE POLICY "Players insert trivia answers" ON trivia_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own compat answers" ON compatibility_answers FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert compat answers" ON compatibility_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update compat answers" ON compatibility_answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read wyr answers" ON wyr_answers FOR SELECT USING (true);
CREATE POLICY "Users insert wyr answers" ON wyr_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update wyr answers" ON wyr_answers FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- RPC: Create trivia invite (inviter picks an invitee from their matches)
-- ============================================================
CREATE OR REPLACE FUNCTION create_trivia_invite(p_invitee_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_match RECORD;
  v_questions UUID[];
  v_session_id UUID;
BEGIN
  -- Verify they are matched
  SELECT id INTO v_match FROM matches
  WHERE (user_a_id = LEAST(v_user_id, p_invitee_id) AND user_b_id = GREATEST(v_user_id, p_invitee_id));
  IF v_match.id IS NULL THEN
    RAISE EXCEPTION 'Not matched with this user';
  END IF;

  -- Check no pending invite already exists between them
  IF EXISTS (
    SELECT 1 FROM trivia_sessions
    WHERE status IN ('pending', 'accepted', 'in_progress')
      AND ((inviter_id = v_user_id AND invitee_id = p_invitee_id)
        OR (inviter_id = p_invitee_id AND invitee_id = v_user_id))
  ) THEN
    RAISE EXCEPTION 'Already have a pending game with this user';
  END IF;

  -- Pick 5 random trivia questions
  SELECT ARRAY_AGG(id) INTO v_questions
  FROM (
    SELECT id FROM game_questions
    WHERE game_type = 'trivia' AND is_active = TRUE
    ORDER BY random()
    LIMIT 5
  ) q;

  IF v_questions IS NULL OR array_length(v_questions, 1) < 1 THEN
    RAISE EXCEPTION 'No trivia questions available';
  END IF;

  INSERT INTO trivia_sessions (inviter_id, invitee_id, question_ids)
  VALUES (v_user_id, p_invitee_id, v_questions)
  RETURNING id INTO v_session_id;

  RETURN jsonb_build_object(
    'session_id', v_session_id,
    'question_ids', v_questions
  );
END;
$$;

-- ============================================================
-- RPC: Respond to trivia invite
-- ============================================================
CREATE OR REPLACE FUNCTION respond_trivia_invite(p_session_id UUID, p_accept BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session trivia_sessions;
BEGIN
  SELECT * INTO v_session FROM trivia_sessions WHERE id = p_session_id;
  IF v_session IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF v_session.invitee_id != v_user_id THEN RAISE EXCEPTION 'Not the invitee'; END IF;
  IF v_session.status != 'pending' THEN RAISE EXCEPTION 'Invite no longer pending'; END IF;

  IF p_accept THEN
    UPDATE trivia_sessions
    SET status = 'in_progress', accepted_at = NOW()
    WHERE id = p_session_id;

    RETURN jsonb_build_object(
      'accepted', true,
      'session_id', p_session_id,
      'question_ids', v_session.question_ids
    );
  ELSE
    UPDATE trivia_sessions SET status = 'declined' WHERE id = p_session_id;
    RETURN jsonb_build_object('accepted', false);
  END IF;
END;
$$;

-- ============================================================
-- RPC: Submit trivia answers
-- ============================================================
CREATE OR REPLACE FUNCTION submit_trivia_answers(
  p_session_id UUID,
  p_answers JSONB  -- [{"question_id": "...", "answer": "a"}, ...]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session trivia_sessions;
  v_answer JSONB;
  v_both_done BOOLEAN;
  v_match_pct INTEGER;
  v_total INTEGER;
  v_matching INTEGER;
BEGIN
  SELECT * INTO v_session FROM trivia_sessions WHERE id = p_session_id;
  IF v_session IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF v_user_id NOT IN (v_session.inviter_id, v_session.invitee_id) THEN
    RAISE EXCEPTION 'Not a player in this session';
  END IF;
  IF v_session.status NOT IN ('in_progress', 'pending') THEN
    RAISE EXCEPTION 'Session not active';
  END IF;

  -- Insert answers
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    INSERT INTO trivia_answers (session_id, question_id, user_id, answer)
    VALUES (
      p_session_id,
      (v_answer->>'question_id')::UUID,
      v_user_id,
      v_answer->>'answer'
    )
    ON CONFLICT (session_id, question_id, user_id) DO UPDATE SET answer = EXCLUDED.answer;
  END LOOP;

  -- Check if both players answered all questions
  v_both_done := (
    SELECT COUNT(DISTINCT user_id) = 2
    FROM trivia_answers
    WHERE session_id = p_session_id
    HAVING COUNT(*) >= array_length(v_session.question_ids, 1) * 2
  );

  IF COALESCE(v_both_done, false) THEN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE a1.answer = a2.answer)
    INTO v_total, v_matching
    FROM trivia_answers a1
    JOIN trivia_answers a2 ON a1.session_id = a2.session_id
      AND a1.question_id = a2.question_id
      AND a1.user_id != a2.user_id
    WHERE a1.session_id = p_session_id
      AND a1.user_id = v_session.inviter_id;

    v_match_pct := CASE WHEN v_total > 0 THEN ROUND((v_matching::NUMERIC / v_total) * 100) ELSE 0 END;

    UPDATE trivia_sessions SET status = 'completed', completed_at = NOW() WHERE id = p_session_id;

    RETURN jsonb_build_object('completed', true, 'match_percentage', v_match_pct);
  END IF;

  RETURN jsonb_build_object('completed', false, 'submitted', true);
END;
$$;

-- ============================================================
-- RPC: Get trivia results
-- ============================================================
CREATE OR REPLACE FUNCTION get_trivia_results(p_session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session trivia_sessions;
  v_partner_id UUID;
  v_partner RECORD;
  v_answers JSONB;
  v_match_pct INTEGER;
  v_total INTEGER;
  v_matching INTEGER;
BEGIN
  SELECT * INTO v_session FROM trivia_sessions WHERE id = p_session_id;
  IF v_session IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF v_user_id NOT IN (v_session.inviter_id, v_session.invitee_id) THEN
    RAISE EXCEPTION 'Not a player';
  END IF;

  v_partner_id := CASE WHEN v_session.inviter_id = v_user_id THEN v_session.invitee_id ELSE v_session.inviter_id END;
  SELECT name, avatar_url, is_verified INTO v_partner FROM profiles WHERE id = v_partner_id;

  SELECT jsonb_agg(jsonb_build_object(
    'question_id', qa.question_id,
    'my_answer', my.answer,
    'their_answer', their.answer
  ))
  INTO v_answers
  FROM unnest(v_session.question_ids) AS qa(question_id)
  LEFT JOIN trivia_answers my ON my.session_id = p_session_id AND my.question_id = qa.question_id AND my.user_id = v_user_id
  LEFT JOIN trivia_answers their ON their.session_id = p_session_id AND their.question_id = qa.question_id AND their.user_id = v_partner_id;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE a1.answer = a2.answer)
  INTO v_total, v_matching
  FROM trivia_answers a1
  JOIN trivia_answers a2 ON a1.session_id = a2.session_id AND a1.question_id = a2.question_id AND a1.user_id != a2.user_id
  WHERE a1.session_id = p_session_id AND a1.user_id = v_session.inviter_id;

  v_match_pct := CASE WHEN v_total > 0 THEN ROUND((v_matching::NUMERIC / v_total) * 100) ELSE 0 END;

  RETURN jsonb_build_object(
    'session_id', p_session_id,
    'status', v_session.status,
    'match_percentage', v_match_pct,
    'partner', jsonb_build_object('id', v_partner_id, 'name', v_partner.name, 'avatar_url', v_partner.avatar_url, 'is_verified', v_partner.is_verified),
    'answers', v_answers
  );
END;
$$;

-- ============================================================
-- RPC: Get pending trivia invites for current user
-- ============================================================
CREATE OR REPLACE FUNCTION get_pending_trivia_invites()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Expire old invites first
  UPDATE trivia_sessions SET status = 'expired'
  WHERE status = 'pending' AND expires_at < NOW();

  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'session_id', ts.id,
      'inviter', jsonb_build_object('id', p.id, 'name', p.name, 'avatar_url', p.avatar_url, 'is_verified', p.is_verified),
      'created_at', ts.created_at
    ) ORDER BY ts.created_at DESC)
    FROM trivia_sessions ts
    JOIN profiles p ON p.id = ts.inviter_id
    WHERE ts.invitee_id = v_user_id AND ts.status = 'pending'
  ), '[]'::JSONB);
END;
$$;

-- ============================================================
-- RPC: Get my trivia history
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_trivia_sessions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'session_id', ts.id,
      'status', ts.status,
      'partner', jsonb_build_object(
        'id', p.id, 'name', p.name, 'avatar_url', p.avatar_url
      ),
      'created_at', ts.created_at,
      'is_inviter', ts.inviter_id = v_user_id
    ) ORDER BY ts.created_at DESC)
    FROM trivia_sessions ts
    JOIN profiles p ON p.id = CASE WHEN ts.inviter_id = v_user_id THEN ts.invitee_id ELSE ts.inviter_id END
    WHERE (ts.inviter_id = v_user_id OR ts.invitee_id = v_user_id)
      AND ts.created_at > NOW() - INTERVAL '7 days'
  ), '[]'::JSONB);
END;
$$;

-- ============================================================
-- RPC: Submit compatibility answers and find compatible users
-- ============================================================
CREATE OR REPLACE FUNCTION submit_compatibility_answers(p_answers JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_answer JSONB;
BEGIN
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    INSERT INTO compatibility_answers (user_id, question_id, answer)
    VALUES (
      v_user_id,
      (v_answer->>'question_id')::UUID,
      v_answer->>'answer'
    )
    ON CONFLICT (user_id, question_id)
    DO UPDATE SET answer = EXCLUDED.answer, answered_at = NOW();
  END LOOP;

  RETURN jsonb_build_object('saved', true);
END;
$$;

-- ============================================================
-- RPC: Find compatible users based on compatibility answers
-- ============================================================
CREATE OR REPLACE FUNCTION find_compatible_users()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_my_count INTEGER;
BEGIN
  -- Count how many compatibility questions the user has answered
  SELECT COUNT(*) INTO v_my_count FROM compatibility_answers WHERE user_id = v_user_id;
  IF v_my_count < 3 THEN
    RETURN jsonb_build_object('profiles', '[]'::JSONB, 'min_answers', 3, 'current', v_my_count);
  END IF;

  RETURN jsonb_build_object('profiles', COALESCE((
    SELECT jsonb_agg(r ORDER BY r.pct DESC)
    FROM (
      SELECT jsonb_build_object(
        'user_id', ca.user_id,
        'name', p.name,
        'avatar_url', p.avatar_url,
        'is_verified', p.is_verified,
        'compatibility_pct', ROUND((COUNT(*) FILTER (WHERE ca.answer = my.answer)::NUMERIC / COUNT(*)) * 100),
        'common_answers', COUNT(*) FILTER (WHERE ca.answer = my.answer),
        'total_compared', COUNT(*)
      ) AS r
      FROM compatibility_answers ca
      JOIN compatibility_answers my ON my.question_id = ca.question_id AND my.user_id = v_user_id
      JOIN profiles p ON p.id = ca.user_id
      WHERE ca.user_id != v_user_id
        AND p.profile_complete = true
        -- Exclude blocked users
        AND ca.user_id NOT IN (
          SELECT blocked_id FROM blocked_users WHERE blocker_id = v_user_id
          UNION
          SELECT blocker_id FROM blocked_users WHERE blocked_id = v_user_id
        )
        -- Exclude existing matches
        AND ca.user_id NOT IN (
          SELECT CASE WHEN user_a_id = v_user_id THEN user_b_id ELSE user_a_id END
          FROM matches WHERE user_a_id = v_user_id OR user_b_id = v_user_id
        )
      GROUP BY ca.user_id, p.name, p.avatar_url, p.is_verified
      HAVING COUNT(*) >= 3
      ORDER BY ROUND((COUNT(*) FILTER (WHERE ca.answer = my.answer)::NUMERIC / COUNT(*)) * 100) DESC
      LIMIT 10
    ) sub
  ), '[]'::JSONB));
END;
$$;

-- ============================================================
-- RPC: Get today's Would You Rather question
-- ============================================================
CREATE OR REPLACE FUNCTION get_daily_wyr()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_question game_questions;
  v_total INTEGER;
  v_count_a INTEGER;
  v_user_answer TEXT;
BEGIN
  -- Deterministic daily rotation based on day of year
  SELECT * INTO v_question
  FROM game_questions
  WHERE game_type = 'would_you_rather' AND is_active = TRUE
  ORDER BY id  -- stable sort
  OFFSET (EXTRACT(DOY FROM NOW())::INT % (
    SELECT COUNT(*) FROM game_questions WHERE game_type = 'would_you_rather' AND is_active = TRUE
  ))
  LIMIT 1;

  IF v_question IS NULL THEN
    RETURN jsonb_build_object('question', NULL);
  END IF;

  -- Get aggregate stats
  SELECT COUNT(*), COUNT(*) FILTER (WHERE answer = 'a')
  INTO v_total, v_count_a
  FROM wyr_answers WHERE question_id = v_question.id;

  -- Get user's answer
  SELECT answer INTO v_user_answer
  FROM wyr_answers WHERE question_id = v_question.id AND user_id = v_user_id;

  RETURN jsonb_build_object(
    'question', jsonb_build_object(
      'id', v_question.id,
      'question', v_question.question,
      'option_a', v_question.option_a,
      'option_b', v_question.option_b
    ),
    'user_answer', v_user_answer,
    'stats', jsonb_build_object(
      'total_votes', v_total,
      'pct_a', CASE WHEN v_total > 0 THEN ROUND((v_count_a::NUMERIC / v_total) * 100) ELSE 0 END,
      'pct_b', CASE WHEN v_total > 0 THEN ROUND(((v_total - v_count_a)::NUMERIC / v_total) * 100) ELSE 0 END
    )
  );
END;
$$;

-- ============================================================
-- RPC: Answer WYR question
-- ============================================================
CREATE OR REPLACE FUNCTION answer_wyr(p_question_id UUID, p_answer TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_total INTEGER;
  v_count_a INTEGER;
BEGIN
  INSERT INTO wyr_answers (user_id, question_id, answer)
  VALUES (v_user_id, p_question_id, p_answer)
  ON CONFLICT (user_id, question_id)
  DO UPDATE SET answer = EXCLUDED.answer, answered_at = NOW();

  -- Return updated stats
  SELECT COUNT(*), COUNT(*) FILTER (WHERE answer = 'a')
  INTO v_total, v_count_a
  FROM wyr_answers WHERE question_id = p_question_id;

  RETURN jsonb_build_object(
    'total_votes', v_total,
    'pct_a', CASE WHEN v_total > 0 THEN ROUND((v_count_a::NUMERIC / v_total) * 100) ELSE 0 END,
    'pct_b', CASE WHEN v_total > 0 THEN ROUND(((v_total - v_count_a)::NUMERIC / v_total) * 100) ELSE 0 END
  );
END;
$$;

-- ============================================================
-- RPC: Get a user's WYR answers (for profile display)
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_wyr_answers(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  -- Check not blocked
  IF EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = v_user_id AND blocked_id = p_user_id)
       OR (blocker_id = p_user_id AND blocked_id = v_user_id)
  ) THEN
    RETURN '[]'::JSONB;
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'question', gq.question,
      'option_a', gq.option_a,
      'option_b', gq.option_b,
      'answer', wa.answer
    ) ORDER BY wa.answered_at DESC)
    FROM wyr_answers wa
    JOIN game_questions gq ON gq.id = wa.question_id
    WHERE wa.user_id = p_user_id
    LIMIT 5
  ), '[]'::JSONB);
END;
$$;

-- ============================================================
-- Seed: Would You Rather questions
-- ============================================================
INSERT INTO game_questions (game_type, question, option_a, option_b) VALUES
  ('would_you_rather', '{"es":"Playa o montaña?","en":"Beach or mountain?"}', '{"es":"Playa","en":"Beach"}', '{"es":"Montaña","en":"Mountain"}'),
  ('would_you_rather', '{"es":"Película en casa o cine?","en":"Movie at home or cinema?"}', '{"es":"Película en casa","en":"Movie at home"}', '{"es":"Cine","en":"Cinema"}'),
  ('would_you_rather', '{"es":"Madrugar o trasnochar?","en":"Wake up early or stay up late?"}', '{"es":"Madrugar","en":"Wake up early"}', '{"es":"Trasnochar","en":"Stay up late"}'),
  ('would_you_rather', '{"es":"Cocinar o que cocinen para ti?","en":"Cook or have someone cook for you?"}', '{"es":"Cocinar","en":"Cook"}', '{"es":"Que cocinen para ti","en":"Have someone cook for you"}'),
  ('would_you_rather', '{"es":"Viajar al pasado o al futuro?","en":"Travel to the past or the future?"}', '{"es":"Viajar al pasado","en":"Travel to the past"}', '{"es":"Viajar al futuro","en":"Travel to the future"}'),
  ('would_you_rather', '{"es":"Perro o gato?","en":"Dog or cat?"}', '{"es":"Perro","en":"Dog"}', '{"es":"Gato","en":"Cat"}'),
  ('would_you_rather', '{"es":"Café o té?","en":"Coffee or tea?"}', '{"es":"Café","en":"Coffee"}', '{"es":"Té","en":"Tea"}'),
  ('would_you_rather', '{"es":"Verano o invierno?","en":"Summer or winter?"}', '{"es":"Verano","en":"Summer"}', '{"es":"Invierno","en":"Winter"}'),
  ('would_you_rather', '{"es":"Libro o podcast?","en":"Book or podcast?"}', '{"es":"Libro","en":"Book"}', '{"es":"Podcast","en":"Podcast"}'),
  ('would_you_rather', '{"es":"Ciudad o campo?","en":"City or countryside?"}', '{"es":"Vivir en la ciudad","en":"Live in the city"}', '{"es":"Vivir en el campo","en":"Live in the countryside"}');

-- Seed: Compatibility questions
INSERT INTO game_questions (game_type, question, option_a, option_b) VALUES
  ('compatibility', '{"es":"En una primera cita prefieres...","en":"On a first date you prefer..."}', '{"es":"Algo tranquilo","en":"Something chill"}', '{"es":"Algo aventurero","en":"Something adventurous"}'),
  ('compatibility', '{"es":"En una relación valoras más...","en":"In a relationship you value more..."}', '{"es":"Espacio personal","en":"Personal space"}', '{"es":"Tiempo juntas","en":"Time together"}'),
  ('compatibility', '{"es":"Ante un conflicto prefieres...","en":"When facing conflict you prefer..."}', '{"es":"Hablarlo al momento","en":"Talk about it right away"}', '{"es":"Pensarlo antes","en":"Think about it first"}'),
  ('compatibility', '{"es":"Tu fin de semana ideal es...","en":"Your ideal weekend is..."}', '{"es":"Planes con gente","en":"Plans with people"}', '{"es":"Relax en casa","en":"Relaxing at home"}'),
  ('compatibility', '{"es":"Qué te hace más feliz?","en":"What makes you happier?"}', '{"es":"Experiencias","en":"Experiences"}', '{"es":"Estabilidad","en":"Stability"}'),
  ('compatibility', '{"es":"Prefieres mostrar cariño con...","en":"You prefer to show affection with..."}', '{"es":"Palabras","en":"Words"}', '{"es":"Gestos","en":"Actions"}'),
  ('compatibility', '{"es":"Tu forma de comunicarte es...","en":"Your communication style is..."}', '{"es":"Directa","en":"Direct"}', '{"es":"Sutil","en":"Subtle"}'),
  ('compatibility', '{"es":"De viaje prefieres...","en":"When traveling you prefer..."}', '{"es":"Planificarlo todo","en":"Plan everything"}', '{"es":"Improvisar","en":"Improvise"}');

-- Seed: Trivia questions
INSERT INTO game_questions (game_type, question, option_a, option_b) VALUES
  ('trivia', '{"es":"Series o películas?","en":"TV shows or movies?"}', '{"es":"Series","en":"TV shows"}', '{"es":"Películas","en":"Movies"}'),
  ('trivia', '{"es":"Dulce o salado?","en":"Sweet or salty?"}', '{"es":"Dulce","en":"Sweet"}', '{"es":"Salado","en":"Salty"}'),
  ('trivia', '{"es":"Mañana o noche?","en":"Morning or night?"}', '{"es":"Mañana","en":"Morning"}', '{"es":"Noche","en":"Night"}'),
  ('trivia', '{"es":"Llamar o mandar mensaje?","en":"Call or text?"}', '{"es":"Llamar","en":"Call"}', '{"es":"Mensaje","en":"Text"}'),
  ('trivia', '{"es":"Pizza o sushi?","en":"Pizza or sushi?"}', '{"es":"Pizza","en":"Pizza"}', '{"es":"Sushi","en":"Sushi"}'),
  ('trivia', '{"es":"Bailar o cantar?","en":"Dance or sing?"}', '{"es":"Bailar","en":"Dance"}', '{"es":"Cantar","en":"Sing"}'),
  ('trivia', '{"es":"Playa o piscina?","en":"Beach or pool?"}', '{"es":"Playa","en":"Beach"}', '{"es":"Piscina","en":"Pool"}'),
  ('trivia', '{"es":"Instagram o TikTok?","en":"Instagram or TikTok?"}', '{"es":"Instagram","en":"Instagram"}', '{"es":"TikTok","en":"TikTok"}');
