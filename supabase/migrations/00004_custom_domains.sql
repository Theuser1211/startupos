-- Migration: Create custom_domains table for website deployment
-- Run after 00003_deployments.sql

-- ============================================================
-- CUSTOM DOMAINS — user-connected domains for deployed websites
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES generated_websites(id) ON DELETE SET NULL,
  deployment_id UUID REFERENCES deployments(id) ON DELETE SET NULL,
  domain TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'failed')),
  dns_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_domain UNIQUE (domain),
  CONSTRAINT unique_user_domain UNIQUE (user_id, domain)
);

ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own domains"
  ON custom_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own domains"
  ON custom_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains"
  ON custom_domains FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own domains"
  ON custom_domains FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id ON custom_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_website_id ON custom_domains(website_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON custom_domains(verification_status);
CREATE INDEX IF NOT EXISTS idx_custom_domains_created_at ON custom_domains(created_at DESC);

CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
