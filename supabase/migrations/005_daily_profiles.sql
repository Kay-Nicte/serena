-- Daily profiles (swipe history)
CREATE TABLE daily_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action daily_action NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_id, created_at::date)
);

CREATE INDEX idx_daily_profiles_user_date ON daily_profiles(user_id, created_at);
CREATE INDEX idx_daily_profiles_target ON daily_profiles(target_id);
