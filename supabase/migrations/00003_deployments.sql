-- Migration: Create deployments table for tracking website deployment history
-- Run after 00002_production_tables.sql
-- Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================================
-- 1. UPDATED generated_websites — ensure all required columns exist
-- ============================================================

-- Add deployment_logs column if missing
ALTER TABLE generated_websites
  ADD COLUMN IF NOT EXISTS deployment_logs JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Add deployment_provider column if missing
ALTER TABLE generated_websites
  ADD COLUMN IF NOT EXISTS deployment_provider TEXT;

-- ============================================================
-- 2. DEPLOYMENTS — full deployment history table
-- ============================================================
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES generated_websites(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'vercel',
  deployment_url TEXT,
  deployment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (deployment_status IN ('pending', 'building', 'deployed', 'failed')),
  deployment_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own deployments"
  ON deployments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deployments"
  ON deployments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deployments"
  ON deployments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deployments"
  ON deployments FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_website_id ON deployments(website_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(deployment_status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_deployments_updated_at
  BEFORE UPDATE ON deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. UPDATE delete-account cleanup to include deployments
-- ============================================================

-- Note: The delete-account API route already handles generated_websites
-- (which cascades to deployments). For the startups table, the FK is
-- SET NULL, so no additional cleanup is needed.

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

/*
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'deployments';

SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'deployments'
ORDER BY ordinal_position;
*/
