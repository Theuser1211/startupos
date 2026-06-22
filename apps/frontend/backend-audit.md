---
noteId: "aa36fc0064e311f19f5387f7ed2e97d7"
tags: []

---

# StartupOS Backend Audit

## Phase 1: Discovery

This document outlines the backend architecture of StartupOS, identifying key components, their interactions, and potential areas for improvement.

### 1. Authentication

- **Files:**
  - `app/api/auth/callback/route.ts`: Handles authentication callbacks (likely Supabase Auth).
  - `lib/supabase/server.ts`: Provides Supabase client for server-side operations, including auth.
  - `lib/supabase/client.ts`: Provides Supabase client for client-side operations.
- **Key Concepts:** JWTs, session management via cookies, Supabase Auth.

### 2. Authorization

- **Files:**
  - Row Level Security (RLS) policies defined in `supabase/migrations/00002_production_tables.sql` for tables like `profiles`, `startups`, `generated_logos`, `generated_websites`, `subscriptions`, `usage_tracking`, `audit_logs`.
- **Key Concepts:** RLS policies enforcing data access based on user ID and roles.

### 3. Database

- **Files:**
  - `supabase/migrations/00002_production_tables.sql`: Defines the core database schema, including tables for profiles, startups, blueprints, logos, websites, subscriptions, usage tracking, and audit logs.
  - `lib/supabase/service.ts`: Provides a Supabase client with service role permissions, likely for admin operations.
- **Key Concepts:** PostgreSQL, Supabase database, UUIDs as primary keys, RLS, foreign key constraints, indexes for performance.

### 4. Supabase

- **Files:**
  - `lib/supabase/server.ts`: Server-side Supabase client.
  - `lib/supabase/client.ts`: Client-side Supabase client.
  - `lib/supabase/service.ts`: Supabase client with service role permissions.
  - `supabase/migrations/`: Contains SQL migration files for schema changes.
  - `supabase/.temp/`: Contains temporary Supabase CLI related files.
  - `supabase/email-templates/`: Email templates used by Supabase functions.
- **Key Concepts:** Supabase provides authentication, database, storage, and edge functions.

### 5. API Routes

- **Files:**
  - `app/api/**/route.ts`: Define various API endpoints for different functionalities.
    - `delete-account/route.ts`: Handles user account deletion.
    - `blueprints/route.ts`: CRUD operations for blueprints.
    - `deployments/route.ts`: Handles website deployments to Vercel.
    - `websites/spec/route.ts`: Enqueues website specification generation jobs.
    - `inngest/route.ts`: Inngest webhook handler for background jobs.
    - `logos/route.ts`: Handles logo generation requests.
- **Key Concepts:** Next.js API Routes, handling GET, POST, PUT, DELETE methods, rate limiting, Supabase integration.

### 6. AI Generation

- **Files:**
  - `lib/ai/client.ts`: Client for interacting with AI models (Gemini, Groq, DeepSeek).
  - `lib/ai/providers/`: Contains specific AI provider implementations.
  - `app/api/websites/spec/route.ts`: Enqueues website spec generation jobs.
  - `app/api/websites/spec/functions.ts`: Background function to generate website specs using AI.
  - `app/api/logos/route.ts`: Handles logo generation requests.
  - `app/api/logos/functions.ts`: Background function for logo generation.
  - `scripts/qa-*.ts`: Scripts for quality assurance of AI generation.
- **Key Concepts:** Gemini, Groq, DeepSeek for text generation, prompt engineering, JSON parsing for AI output, Inngest for background job queueing.

### 7. Website Generation

- **Files:**
  - `app/api/websites/spec/route.ts`: Initiates website spec generation.
  - `app/api/websites/spec/functions.ts`: Core logic for generating website specs.
  - `lib/startup/website-spec.ts`: Defines `WebsiteSpec` type and validation logic.
  - `lib/startup/render-spec-to-html.ts`: Renders a website spec to HTML.
  - `app/api/deployments/route.ts`: Handles deployment of generated websites to Vercel.
- **Key Concepts:** AI-generated website specifications, Vercel deployment integration, template usage.

### 8. Deployments

- **Files:**
  - `app/api/deployments/route.ts`: Handles website deployment requests.
  - `lib/startup/deploy.ts`: Contains logic for deploying to Vercel.
- **Key Concepts:** Vercel integration, deployment status tracking.

### 9. Queues

- **Files:**
  - `lib/inngest/client.ts`: Inngest client configuration.
  - `app/api/inngest/route.ts`: Inngest server handler.
  - `app/api/websites/spec/functions.ts`: Handles `website-spec/generate` Inngest event.
  - `app/api/logos/functions.ts`: Handles `logo/generate` Inngest event.
- **Key Concepts:** Inngest for background job processing, event-driven architecture.

### 10. Persistence

- **Key Concepts:** Primarily uses Supabase (PostgreSQL) for data persistence. `generated_websites` and `generated_logos` tables store generated content and metadata.

### 11. Storage

- **Key Concepts:** No explicit files found for dedicated storage service. Assumed to be handled implicitly via Supabase Storage or embedded in database JSONB fields for metadata and specifications.

### 12. Public Pages

- **Files:**
  - `app/api/public-blueprints/[token]/route.ts`: Likely serves publicly shareable blueprint data.
- **Key Concepts:** Sharing mechanism using tokens, public access to specific data.

### 13. Environment Variables

- **Files:**
  - `.env.example`, `.env.local`: Store environment variables.
  - `next.config.ts`: Configures Next.js, potentially including environment variables.
- **Key Concepts:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GOOGLE_API_KEY`, `AI_API_KEY`, `AI_BASE_URL`, `LOG_LEVEL`.

### 14. Background Jobs

- **Key Concepts:** Managed via Inngest. Functions like `website-spec/generate` and `logo/generate` are executed asynchronously.

### 15. Rate Limiting

- **Files:**
  - `lib/security/rate-limit.ts`: Implements in-memory rate limiting with different tiers (`strictLimiter`, `apiLimiter`, `generousLimiter`, `deleteAccountLimiter`).
  - Rate limiting checks are present in API route handlers (e.g., `/api/blueprints`, `/api/deployments`, `/api/auth/delete-account`).
- **Key Concepts:** In-memory rate limiting, per-user/per-IP limits, protection against abuse.

### 16. Logging

- **Files:**
  - `lib/logging.ts`: Provides a structured logging utility.
- **Key Concepts:** Structured logs with `service`, `level`, `message`, `data`, and `error` fields. Log level configurable via `LOG_LEVEL` environment variable.

---

## Next Steps

Proceeding to Phase 2: Production Audit.