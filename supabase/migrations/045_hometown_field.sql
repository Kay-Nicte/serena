-- Add hometown field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hometown TEXT;
