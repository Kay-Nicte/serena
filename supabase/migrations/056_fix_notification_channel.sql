-- Fix Android notification channel ID from 'default' to 'serenade'
-- The Android channel was previously registered as 'default' (when app was named 'Serena'),
-- causing notification titles to show cached channel name. New channel ID forces fresh creation.

CREATE OR REPLACE FUNCTION public.send_push_notification(
  p_user_id uuid,
  p_title text,
  p_body text,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token text;
BEGIN
  SELECT token INTO v_token
  FROM public.push_tokens
  WHERE user_id = p_user_id;

  IF v_token IS NULL THEN
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Accept', 'application/json'
    ),
    body := jsonb_build_object(
      'to', v_token,
      'title', p_title,
      'body', p_body,
      'data', p_data,
      'sound', 'default',
      'priority', 'high',
      'channelId', 'serenade'
    )
  );
END;
$$;
