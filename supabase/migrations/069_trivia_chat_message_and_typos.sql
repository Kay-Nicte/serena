-- ============================================================
-- 069: Send chat message when trivia completes + fix question typos
-- ============================================================

-- Update submit_trivia_answers to insert a chat message when both players finish
CREATE OR REPLACE FUNCTION submit_trivia_answers(
  p_session_id UUID,
  p_answers JSONB
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
  v_match_id UUID;
  v_msg TEXT;
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

    -- Send a message in their chat with the result
    SELECT id INTO v_match_id FROM matches
    WHERE user_a_id = LEAST(v_session.inviter_id, v_session.invitee_id)
      AND user_b_id = GREATEST(v_session.inviter_id, v_session.invitee_id);

    IF v_match_id IS NOT NULL THEN
      v_msg := 'Afinidad completada: ' || v_match_pct || '% de compatibilidad';

      INSERT INTO messages (match_id, sender_id, content)
      VALUES (v_match_id, v_user_id, v_msg);
    END IF;

    RETURN jsonb_build_object('completed', true, 'match_percentage', v_match_pct);
  END IF;

  RETURN jsonb_build_object('completed', false, 'submitted', true);
END;
$$;

-- ============================================================
-- Fix Spanish punctuation: add ¿ and ¡ where missing
-- ============================================================

-- Trivia questions
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Series o películas?"') WHERE question->>'es' = 'Series o películas?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Dulce o salado?"') WHERE question->>'es' = 'Dulce o salado?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Mañana o noche?"') WHERE question->>'es' = 'Mañana o noche?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Llamar o mandar mensaje?"') WHERE question->>'es' = 'Llamar o mandar mensaje?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Pizza o sushi?"') WHERE question->>'es' = 'Pizza o sushi?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Bailar o cantar?"') WHERE question->>'es' = 'Bailar o cantar?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Playa o piscina?"') WHERE question->>'es' = 'Playa o piscina?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Instagram o TikTok?"') WHERE question->>'es' = 'Instagram o TikTok?';

-- Would You Rather questions
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Playa o montaña?"') WHERE question->>'es' = 'Playa o montaña?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Película en casa o cine?"') WHERE question->>'es' = 'Película en casa o cine?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Madrugar o trasnochar?"') WHERE question->>'es' = 'Madrugar o trasnochar?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Cocinar o que cocinen para ti?"') WHERE question->>'es' = 'Cocinar o que cocinen para ti?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Viajar al pasado o al futuro?"') WHERE question->>'es' = 'Viajar al pasado o al futuro?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Perro o gato?"') WHERE question->>'es' = 'Perro o gato?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Café o té?"') WHERE question->>'es' = 'Café o té?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Verano o invierno?"') WHERE question->>'es' = 'Verano o invierno?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Libro o podcast?"') WHERE question->>'es' = 'Libro o podcast?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Ciudad o campo?"') WHERE question->>'es' = 'Ciudad o campo?';

-- Compatibility questions
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"En una primera cita prefieres..."') WHERE question->>'es' = 'En una primera cita prefieres...';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"En una relación valoras más..."') WHERE question->>'es' = 'En una relación valoras más...';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"Ante un conflicto prefieres..."') WHERE question->>'es' = 'Ante un conflicto prefieres...';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"Tu fin de semana ideal es..."') WHERE question->>'es' = 'Tu fin de semana ideal es...';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Qué te hace más feliz?"') WHERE question->>'es' = 'Qué te hace más feliz?';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"¿Tu forma de comunicarte es...?"') WHERE question->>'es' = 'Tu forma de comunicarte es...';
UPDATE game_questions SET question = jsonb_set(question, '{es}', '"De viaje prefieres..."') WHERE question->>'es' = 'De viaje prefieres...';

-- Also fix the WYR title in 068 seed: "Que prefieres?" -> "¿Qué prefieres?"
-- (This is in the i18n files, handled separately)
