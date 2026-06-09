-- Migration: Add public blueprint support
-- Run after 00004_custom_domains.sql

-- Add new columns to blueprints table
ALTER TABLE blueprints
  ADD COLUMN visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  ADD COLUMN share_token TEXT UNIQUE NULL,
  ADD COLUMN public_sections JSONB DEFAULT '["tagline","verdict","roadmap","roast"]',
  ADD COLUMN public_views INTEGER DEFAULT 0;

-- Partial index for share_token (only non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_blueprints_share_token 
  ON blueprints(share_token) 
  WHERE share_token IS NOT NULL;

-- Public read policy for published blueprints
CREATE POLICY "Public read for published blueprints"
  ON blueprints FOR SELECT
  USING (visibility = 'public');
