-- Enums for Serenade

CREATE TYPE orientation AS ENUM (
  'lesbian',
  'bisexual',
  'pansexual',
  'queer',
  'other'
);

CREATE TYPE looking_for AS ENUM (
  'friendship',
  'dating',
  'relationship',
  'explore'
);

CREATE TYPE daily_action AS ENUM (
  'like',
  'pass'
);

CREATE TYPE report_reason AS ENUM (
  'inappropriate_content',
  'fake_profile',
  'harassment',
  'spam',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'reviewed',
  'resolved',
  'dismissed'
);
