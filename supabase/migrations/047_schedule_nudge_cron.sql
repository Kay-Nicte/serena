-- 047_schedule_nudge_cron.sql
-- Programa la función notify_stale_matches() para que se ejecute
-- automáticamente todos los días a las 10:00 UTC.

-- 1. Activar la extensión pg_cron (viene incluida en Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Programar la tarea diaria
SELECT cron.schedule(
  'nudge-stale-matches',   -- nombre del job
  '0 10 * * *',            -- cada día a las 10:00 UTC
  'SELECT notify_stale_matches()'
);
