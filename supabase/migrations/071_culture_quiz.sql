-- ============================================================
-- 071: Culture Quiz - daily trivia with leaderboard
-- ============================================================

-- Quiz questions: 4 options, 1 correct
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question JSONB NOT NULL,         -- {"es":"...","en":"...",...}
  options JSONB NOT NULL,           -- [{"es":"...","en":"..."}, ...] (4 options)
  correct_option INTEGER NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One attempt per user per day
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL DEFAULT 10,
  played_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, played_at)
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_date ON quiz_attempts(played_at, score DESC);

-- Toggle to show quiz score on profile
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_quiz_score BOOLEAN DEFAULT FALSE;

-- RLS
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quiz questions" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Users see own quiz attempts" ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own quiz attempts" ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- Allow reading others' attempts for leaderboard (via RPC with SECURITY DEFINER)

-- ============================================================
-- RPC: Get today's 10 quiz questions (same for everyone each day)
-- ============================================================
CREATE OR REPLACE FUNCTION get_daily_quiz()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_seed INTEGER;
  v_already_played BOOLEAN;
  v_questions JSONB;
BEGIN
  -- Check if already played today
  SELECT EXISTS (
    SELECT 1 FROM quiz_attempts WHERE user_id = v_user_id AND played_at = v_today
  ) INTO v_already_played;

  IF v_already_played THEN
    RETURN jsonb_build_object('already_played', true);
  END IF;

  -- Deterministic seed based on date (same questions for everyone each day)
  v_seed := EXTRACT(DOY FROM v_today)::INT * 1000 + EXTRACT(YEAR FROM v_today)::INT;

  SELECT jsonb_agg(sub.q) INTO v_questions
  FROM (
    SELECT jsonb_build_object(
      'id', id,
      'question', question,
      'options', options,
      'category', category
    ) AS q
    FROM quiz_questions
    WHERE is_active = TRUE
    ORDER BY md5(id::text || v_seed::text)
    LIMIT 10
  ) sub;

  RETURN jsonb_build_object(
    'already_played', false,
    'questions', COALESCE(v_questions, '[]'::jsonb)
  );
END;
$$;

-- ============================================================
-- RPC: Submit quiz answers and get score
-- ============================================================
CREATE OR REPLACE FUNCTION submit_quiz(p_answers JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_score INTEGER := 0;
  v_total INTEGER := 0;
  v_answer JSONB;
  v_correct INTEGER;
BEGIN
  -- Prevent double submission
  IF EXISTS (SELECT 1 FROM quiz_attempts WHERE user_id = v_user_id AND played_at = v_today) THEN
    RETURN jsonb_build_object('error', 'already_played');
  END IF;

  -- Calculate score: p_answers = [{"question_id": "...", "selected": 2}, ...]
  FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    SELECT correct_option INTO v_correct
    FROM quiz_questions WHERE id = (v_answer->>'question_id')::UUID;

    IF v_correct IS NOT NULL THEN
      v_total := v_total + 1;
      IF (v_answer->>'selected')::INTEGER = v_correct THEN
        v_score := v_score + 1;
      END IF;
    END IF;
  END LOOP;

  -- Save attempt
  INSERT INTO quiz_attempts (user_id, score, total, played_at)
  VALUES (v_user_id, v_score, v_total, v_today);

  RETURN jsonb_build_object('score', v_score, 'total', v_total);
END;
$$;

-- ============================================================
-- RPC: Get quiz leaderboard (latest attempt per user)
-- ============================================================
CREATE OR REPLACE FUNCTION get_quiz_leaderboard()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  RETURN jsonb_build_object(
    'my_score', (
      SELECT jsonb_build_object('score', qa.score, 'total', qa.total, 'played_at', qa.played_at)
      FROM quiz_attempts qa
      WHERE qa.user_id = v_user_id
      ORDER BY qa.played_at DESC
      LIMIT 1
    ),
    'leaderboard', COALESCE((
      SELECT jsonb_agg(sub.r)
      FROM (
        SELECT DISTINCT ON (qa.user_id) jsonb_build_object(
          'user_id', qa.user_id,
          'name', p.name,
          'avatar_url', p.avatar_url,
          'is_verified', p.is_verified,
          'score', qa.score,
          'total', qa.total,
          'played_at', qa.played_at
        ) AS r,
        qa.score,
        p.name
        FROM quiz_attempts qa
        JOIN profiles p ON p.id = qa.user_id
        WHERE qa.user_id != v_user_id
          AND p.banned_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM user_blocks ub
            WHERE (ub.blocker_id = v_user_id AND ub.blocked_id = qa.user_id)
               OR (ub.blocker_id = qa.user_id AND ub.blocked_id = v_user_id)
          )
        ORDER BY qa.user_id, qa.played_at DESC, qa.score DESC, p.name
      ) sub
    ), '[]'::jsonb)
  );
END;
$$;

-- ============================================================
-- RPC: Get a user's quiz score (for profile display)
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_quiz_score(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return if the user has opted to show their score
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND show_quiz_score = TRUE) THEN
    RETURN jsonb_build_object('visible', false);
  END IF;

  RETURN jsonb_build_object(
    'visible', true,
    'score', (
      SELECT jsonb_build_object('score', qa.score, 'total', qa.total)
      FROM quiz_attempts qa
      WHERE qa.user_id = p_user_id
      ORDER BY qa.played_at DESC
      LIMIT 1
    )
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
