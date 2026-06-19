# StartupOS — Implementation Roadmap

> Audit date: 2026-06-19
> Prioritized by business impact, not technical preference

---

## Phase A — Must Fix Before Launch

> These items make the product functional. Without them, users cannot use StartupOS.

| # | Task | Description | Est. Effort | Dependencies |
|---|------|-------------|-------------|--------------|
| A1 | **Build frontend app** | React/Next.js UI with: auth screens, startup dashboard, blueprint viewer, website generation flow, deployment flow | 3-4 weeks | None |
| A2 | **Website rendering engine** | Convert WebsiteSpec (JSON) into actual HTML/CSS/JS. Template-based or component-based renderer that takes pages/sections/theme and produces static files | 1-2 weeks | A1 (needs to define output format) |
| A3 | **Hosting integration** | Deploy rendered HTML to Vercel/Netlify/Cloudflare Pages. Get real URLs. Store deployment URL from hosting provider response | 1 week | A2 |
| A4 | **Public share pages** | Unauthenticated route to serve deployed website. Either proxy from hosting platform or serve static files directly | 2-3 days | A3 |
| A5 | **Supabase storage wiring** | Connect Supabase storage (env vars already configured) for storing generated assets, or remove dead env vars | 0.5 day | None |

**Phase A total: ~5-7 weeks**

---

## Phase B — Needed For First 100 Users

> These items prevent user friction and security issues at beta scale.

| # | Task | Description | Est. Effort | Dependencies |
|---|------|-------------|-------------|--------------|
| B1 | **Refresh token flow** | Add `/auth/refresh` endpoint. Issue short-lived access token (15min) + refresh token (7d). Store refresh tokens in DB for revocation | 1-2 days | None |
| B2 | **Brute-force login protection** | Per-IP rate limit on `/auth/login` (5 attempts/min). Account lockout after 10 failed attempts. Exponential backoff | 1 day | None |
| B3 | **Pagination** | Add `take`/`skip` or cursor-based pagination to `GET /startups` and future list endpoints | 1 day | None |
| B4 | **Startup update endpoint** | `PATCH /startups/:id` — update name, description, logo, industry | 0.5 day | None |
| B5 | **Blueprint editing** | `PATCH /blueprints/:id` — allow user to edit AI-generated blueprint before generating website | 1 day | None |
| B6 | **Email notifications** | Welcome email on signup. Email when blueprint/website generation completes. Use Resend or SendGrid | 1-2 days | None |
| B7 | **Per-user AI rate limits** | Max 10 blueprint generations per user per month. Max 5 website generations per month. Return 429 with clear message | 1 day | None |
| B8 | **Improve rate limiting** | Replace global 100 req/min with per-route limits. Auth: 10/min. AI generation: 5/min. Read endpoints: 100/min | 1 day | None |

**Phase B total: ~7-10 days**

---

## Phase C — Needed For First 1000 Users

> These items prevent operational failure at scale.

| # | Task | Description | Est. Effort | Dependencies |
|---|------|-------------|-------------|--------------|
| C1 | **Token revocation** | Token version on User model. On logout or password change, increment version. JWT includes version; verify checks it | 1 day | B1 |
| C2 | **Soft deletes** | Add `deletedAt` timestamp to all models. Filter by default. Add recovery mechanism | 1-2 days | None |
| C3 | **Worker graceful shutdown** | Call `worker.close()` in SIGTERM handler. Wait for in-flight jobs to complete (with timeout) | 0.5 day | None |
| C4 | **Composite indexes** | Add `[userId, createdAt]` on Startup. Add `[startupId]` on Website. Add `[type, status]` on Job | 0.5 day | None |
| C5 | **Connection pooling** | Configure Prisma connection pool (20-50 connections). Add PgBouncer if needed for production | 1 day | None |
| C6 | **Dead letter queue** | Implement DLQ for failed BullMQ jobs. Admin endpoint to inspect and retry failed jobs | 1 day | None |
| C7 | **Error tracking (Sentry)** | Integrate Sentry for backend error tracking. Capture unhandled exceptions, AI provider errors, queue failures | 1 day | None |
| C8 | **Deployment state machine** | Formal state machine for DeploymentStatus. Validate transitions at DB level using `updateMany` with where clause | 1 day | None |
| C9 | **Failed deployment recovery** | Allow redeploy when status is FAILED. Add `POST /deployments/:id/retry` endpoint | 1 day | C8 |
| C10 | **API request ID tracking** | Generate UUID per request. Include in all logs and responses. Enable request tracing | 0.5 day | None |

**Phase C total: ~8-10 days**

---

## Phase D — Nice To Have

> These items add polish and competitive advantage but don't block growth.

| # | Task | Description | Est. Effort | Dependencies |
|---|------|-------------|-------------|--------------|
| D1 | **Custom domains** | Let users point their domain to their website. DNS verification, SSL provisioning via Let's Encrypt or Cloudflare | 2-3 weeks | A3 |
| D2 | **Billing integration** | Stripe integration. Free tier (5 startups, 3 generations). Pro tier ($20/mo, unlimited). Usage metering | 2-3 weeks | B7 |
| D3 | **Admin dashboard** | Admin routes: list all users, view system stats, manage AI provider configs, view failed jobs | 1-2 weeks | None |
| D4 | **Analytics** | Track user events (signup, blueprint gen, website gen, deploy). Dashboard for conversion metrics | 1-2 weeks | None |
| D5 | **Monitoring & alerting** | Uptime monitoring (Betterstack/Checkly). Alert on queue depth, AI provider failures, error rate spikes | 1 week | C7 |
| D6 | **Test suite** | Unit tests for handlers, integration tests for queue system, E2E tests for founder journey | 3-5 days | None |
| D7 | **Prisma migrations** | Create proper migration files. Set up migration pipeline for production deployments | 1 day | None |
| D8 | **API versioning** | Add `/v1/` prefix to all routes. Deprecation headers for future changes | 1 day | None |
| D9 | **Website editing** | Allow users to customize generated website after generation (change colors, text, reorder sections) | 2 weeks | A1, A2 |
| D10 | **Multiple websites per startup** | Currently one blueprint → one website. Allow generating multiple website variants | 1 week | A2 |

**Phase D total: ~6-10 weeks (if all implemented)**

---

## Recommended Implementation Order

```
Phase A (Weeks 1-7):    A1 → A2 → A3 → A4 → A5
Phase B (Weeks 8-10):   B1 → B2 → B8 → B3 → B4 → B7 → B5 → B6
Phase C (Weeks 11-13):  C1 → C3 → C4 → C7 → C5 → C8 → C9 → C2 → C6 → C10
Phase D (Weeks 14+):    D6 → D7 → D8 → D5 → D4 → D1 → D2 → D3 → D9 → D10
```

---

## MVP Target

**To launch an MVP, you need:**
- A1 (frontend) — minimum: auth screens + startup list + blueprint gen + website gen + deploy button
- A2 (rendering) — minimum: convert WebsiteSpec to static HTML
- A3 (hosting) — minimum: deploy to Vercel with real URL
- A4 (public pages) — minimum: unauthenticated URL to view website

**Estimated MVP timeline: 4-6 weeks with focused development.**
