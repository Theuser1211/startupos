-- Migration 00007: Logo Generation Jobs
-- Tracks logo generation with status lifecycle (queued → generating → completed | failed)

create table if not exists logo_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  startup_id uuid references startups(id) on delete set null,

  -- Input parameters (stored so the background worker can pick them up)
  startup_name text not null,
  industry text not null,
  brand_colors jsonb not null default '[]'::jsonb,
  tone jsonb not null default '[]'::jsonb,

  -- Status tracking
  status text not null default 'queued'
    check (status in ('queued', 'generating', 'completed', 'failed')),

  -- Output: generated logos array (populated on 'completed')
  logos jsonb,

  -- Error handling
  error_message text,
  retry_count int not null default 0,

  -- Timestamps
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- Indexes
create index if not exists lgj_user_status on logo_generation_jobs(user_id, status);
create index if not exists lgj_created on logo_generation_jobs(created_at desc);
create index if not exists lgj_status on logo_generation_jobs(status) where status = 'queued';

-- Row level security
alter table logo_generation_jobs enable row level security;

-- Users can view their own jobs
create policy "Users can view own logo jobs"
  on logo_generation_jobs for select
  using (auth.uid() = user_id);

-- Users can insert their own jobs
create policy "Users can create logo jobs"
  on logo_generation_jobs for insert
  with check (auth.uid() = user_id);

-- Service role can update any job (background worker)
create policy "Service role can update any logo job"
  on logo_generation_jobs for update
  using (true)
  with check (true);
