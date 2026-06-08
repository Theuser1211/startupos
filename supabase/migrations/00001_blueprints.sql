-- Migration: Create blueprints table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE TABLE IF NOT EXISTS blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  idea TEXT NOT NULL,
  industry TEXT NOT NULL,
  stage TEXT NOT NULL,
  blueprint JSONB NOT NULL DEFAULT '{}'::jsonb,
  interview_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own blueprints"
  ON blueprints
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own blueprints"
  ON blueprints
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blueprints"
  ON blueprints
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own blueprints"
  ON blueprints
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_created_at ON blueprints(created_at DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blueprints_updated_at
  BEFORE UPDATE ON blueprints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
