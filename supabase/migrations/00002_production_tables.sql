-- Migration: Create production-ready schema
-- Run in order after 00001_blueprints.sql
-- Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================================
-- 1. PROFILES — extends auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. STARTUPS — user's startup entities
-- ============================================================
CREATE TABLE IF NOT EXISTS startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  industry TEXT,
  stage TEXT,
  founded_date DATE,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own startups"
  ON startups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own startups"
  ON startups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own startups"
  ON startups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own startups"
  ON startups FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);
CREATE INDEX IF NOT EXISTS idx_startups_created_at ON startups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_startups_industry ON startups(industry);

CREATE TRIGGER update_startups_updated_at
  BEFORE UPDATE ON startups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. UPDATE BLUEPRINTS — add optional startup_id FK
-- ============================================================
ALTER TABLE blueprints
  ADD COLUMN IF NOT EXISTS startup_id UUID REFERENCES startups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blueprints_startup_id ON blueprints(startup_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_industry ON blueprints(industry);
CREATE INDEX IF NOT EXISTS idx_blueprints_stage ON blueprints(stage);

-- ============================================================
-- 4. GENERATED LOGOS — logo generation history
-- ============================================================
CREATE TABLE IF NOT EXISTS generated_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  style TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE generated_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logos"
  ON generated_logos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logos"
  ON generated_logos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logos"
  ON generated_logos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logos"
  ON generated_logos FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_generated_logos_user_id ON generated_logos(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_logos_startup_id ON generated_logos(startup_id);
CREATE INDEX IF NOT EXISTS idx_generated_logos_created_at ON generated_logos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_logos_favorites ON generated_logos(user_id, is_favorite)
  WHERE is_favorite = true;

-- ============================================================
-- 5. GENERATED WEBSITES — website generation history
-- ============================================================
CREATE TABLE IF NOT EXISTS generated_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  template TEXT,
  deployment_url TEXT,
  deployment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (deployment_status IN ('pending', 'building', 'deployed', 'failed')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE generated_websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own websites"
  ON generated_websites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own websites"
  ON generated_websites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own websites"
  ON generated_websites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own websites"
  ON generated_websites FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_generated_websites_user_id ON generated_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_websites_startup_id ON generated_websites(startup_id);
CREATE INDEX IF NOT EXISTS idx_generated_websites_status ON generated_websites(deployment_status);
CREATE INDEX IF NOT EXISTS idx_generated_websites_created_at ON generated_websites(created_at DESC);

CREATE TRIGGER update_generated_websites_updated_at
  BEFORE UPDATE ON generated_websites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. SUBSCRIPTIONS — payment subscription tracking
-- ============================================================
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro');
CREATE TYPE subscription_status AS ENUM (
  'active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired'
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  provider TEXT,
  provider_subscription_id TEXT,
  provider_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_provider_subscription UNIQUE (provider, provider_subscription_id),
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON subscriptions(provider, provider_subscription_id)
  WHERE provider IS NOT NULL;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create free subscription on user signup
CREATE OR REPLACE FUNCTION handle_new_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_subscription();

-- ============================================================
-- 7. USAGE TRACKING — per-user feature usage limits
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature ON usage_tracking(feature);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_feature ON usage_tracking(user_id, feature);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at DESC);

-- Daily usage summary (materialized query helper)
CREATE INDEX IF NOT EXISTS idx_usage_tracking_daily ON usage_tracking(user_id, feature, created_at)
  WHERE created_at >= date_trunc('day', now());

-- ============================================================
-- 8. AUDIT LOGS — security and activity trail
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs (for future admin panel)
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN (
      -- Update this with admin email addresses
      'admin@startupos.app'
    )
  ));

-- System service can insert
CREATE POLICY "Service can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);

-- ============================================================
-- 9. ADDITIONAL INDEXES FOR EXISTING TABLES
-- ============================================================

-- Add full-text search support for blueprints
ALTER TABLE blueprints
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(idea, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_blueprints_search ON blueprints USING GIN(search_vector);

-- ============================================================
-- VERIFICATION QUERIES (run these to confirm the migration)
-- ============================================================

/*

-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'profiles', 'startups', 'blueprints',
    'generated_logos', 'generated_websites',
    'subscriptions', 'usage_tracking', 'audit_logs'
  );

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'startups', 'blueprints',
    'generated_logos', 'generated_websites',
    'subscriptions', 'usage_tracking', 'audit_logs'
  );

-- Check foreign keys
SELECT
  tc.table_schema, tc.constraint_name, tc.table_name, kcu.column_name,
  ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';

-- Check indexes
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'startups', 'blueprints',
    'generated_logos', 'generated_websites',
    'subscriptions', 'usage_tracking', 'audit_logs'
  )
ORDER BY tablename, indexname;

*/
