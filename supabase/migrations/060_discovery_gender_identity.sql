-- Add gender_identity filter to discovery_preferences
ALTER TABLE discovery_preferences
  ADD COLUMN IF NOT EXISTS gender_identity TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gender_identity_include_unspecified BOOLEAN DEFAULT TRUE;
