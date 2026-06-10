-- Migration 00006: Website Generation Jobs
-- Tracks AI website spec generation with status lifecycle

create table if not exists website_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  startup_id uuid references startups(id) on delete set null,
  blueprint_id uuid references blueprints(id) on delete set null,

  -- Status tracking: queued → generating → completed | failed
  status text not null default 'queued'
    check (status in ('queued', 'generating', 'completed', 'failed')),

  -- Output: AI-generated WebsiteSpec (only populated on 'completed')
  website_spec jsonb,

  -- AI metadata
  provider text,
  model text,
  prompt_tokens int,
  output_tokens int,
  duration_ms int,

  -- Error handling
  error_message text,
  retry_count int not null default 0,

  -- Timestamps
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  notified_at timestamptz
);

-- Indexes
create index if not exists wgj_user_status on website_generation_jobs(user_id, status);
create index if not exists wgj_created on website_generation_jobs(created_at desc);
create index if not exists wgj_status on website_generation_jobs(status) where status = 'queued';

-- Row level security
alter table website_generation_jobs enable row level security;

-- Users can view their own jobs
create policy "Users can view own jobs"
  on website_generation_jobs for select
  using (auth.uid() = user_id);

-- Users can insert their own jobs
create policy "Users can create jobs"
  on website_generation_jobs for insert
  with check (auth.uid() = user_id);

-- Service role can update jobs (background worker)
create policy "Service role can update any job"
  on website_generation_jobs for update
  using (true)
  with check (true);
