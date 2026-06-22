# StartupOS — Technical Debt

> Audit date: 2026-06-19

---

## Critical Issues

| # | Issue | Description | Impact | Root Cause | Effort |
|---|-------|-------------|--------|------------|--------|
| C1 | No frontend | No UI exists. Backend API is useless without a client. | Complete product non-functional | Only backend was built | 2-4 weeks |
| C2 | No website rendering | AI generates a WebsiteSpec (JSON describing pages/sections) but nothing converts it into actual HTML/CSS/JS | Users cannot see a website | The rendering step was never implemented | 1-2 weeks |
| C3 | No actual deployment | Deployment just writes a URL string to the database. No hosting platform integration. | Users cannot visit their website | No hosting provider SDK integrated | 1 week |
| C4 | Supabase env vars unused | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_STORAGE_BUCKET` are configured but never imported or used | Dead configuration, potential confusion | Feature was planned but never wired up | 1 hour |

---

## High Issues

| # | Issue | Description | Impact | Root Cause | Effort |
|---|-------|-------------|--------|------------|--------|
| H1 | No refresh tokens | Single 7-day JWT. Users must re-login after expiry. No `/auth/refresh` endpoint. | Forced re-login every 7 days, poor UX | Auth was built minimally | 1-2 days |
| H2 | No token revocation | Leaked JWT valid for full 7 days. No blocklist or token versioning. | Security: compromised tokens cannot be revoked | JWT implementation is basic | 1-2 days |
| H3 | No brute-force login protection | Global rate limit (100 req/min) shared across all endpoints. No per-IP or per-email login limiting. | 100 login attempts/minute possible | Only global rate limiter implemented | 1 day |
| H4 | Global rate limit at 100 req/min | All endpoints share a single 100 req/min bucket. At 1000+ users this blocks legitimate traffic. | Degraded service under moderate load | Rate limiter configured too conservatively | 1 day |
| H5 | No pagination on list endpoints | `GET /startups` returns all records. No `take`/`skip`/`cursor`. | Response bloat and slow queries at scale | Pagination was not implemented | 1 day |
| H6 | No soft deletes | Hard delete cascades remove all data permanently. No recovery. | Data loss risk | Simple delete was faster to build | 1 day |
| H7 | No worker graceful shutdown | SIGTERM closes queue but does not call `worker.close()`. In-flight jobs lost on deploy. | Job loss during deployments | Shutdown handler incomplete | 0.5 day |
| H8 | Missing composite indexes | No `[userId, createdAt]` on Startup, no `[startupId]` on Website. | In-memory sorting on hot paths at scale | Index optimization was deferred | 0.5 day |
| H9 | No per-user AI rate limiting | Single user can generate unlimited blueprints/websites, exhausting API quota. | Budget risk, unfair resource usage | No usage metering exists | 1 day |
| H10 | Website `status` is free text | `Website.status` is `String` in Prisma, not an enum. | Invalid status values possible, no DB-level enforcement | Schema design shortcut | 0.5 day |

---

## Medium Issues

| # | Issue | Description | Impact | Root Cause | Effort |
|---|-------|-------------|--------|------------|--------|
| M1 | No PATCH /startups/:id | Cannot update startup name, description, logo, or industry after creation. | Users must delete and recreate startups | Update endpoint not built | 0.5 day |
| M2 | Eager loading on GET /startups/:id | Loads blueprint + all websites + all deployments + counts in one query. | Slow response for startups with many websites | Query was written for simplicity | 0.5 day |
| M3 | No request ID tracking | No unique request identifier for debugging distributed requests. | Harder to correlate logs and errors | Observability not prioritized | 0.5 day |
| M4 | CORS is fully open | `origin: true` allows any origin. | Potential CSRF exposure in production | Default config for development | 0.5 day |
| M5 | No API version prefix | Routes are `/auth/login`, not `/v1/auth/login`. | Breaking changes require coordinated frontend/backend updates | API versioning was deferred | 1 day |
| M6 | Zod schemas unused in handlers | Zod schemas defined but Fastify JSON Schema used for validation instead. Zod never runs at runtime. | Potential drift between Zod and JSON Schema definitions | Two validation systems were created independently | 0.5 day |
| M7 | No AI cost tracking | No logging of token usage or estimated cost per AI call. | Budget overruns at scale | Cost monitoring not implemented | 1 day |
| M8 | No deployment rollback | Failed deployments permanently block the website. No way to redeploy after failure without manual DB fix. | Website stuck in failed state | Recovery flow not built | 1 day |
| M9 | No deployment state machine | Status can transition from any state to any state. No validation of valid transitions. | Corrupted deployment states possible | State machine was not implemented | 1 day |
| M10 | ApiLog table unused | `ApiLog` model defined in schema, never written to anywhere. | Dead schema, potential confusion | Logging was planned but never wired | 0.5 day |
| M11 | No password complexity rules | Password only requires min 8 chars. No uppercase, digit, or special char requirement. | Weak passwords possible | Minimal validation was intentional for speed | 0.5 day |
| M12 | No deployment logic to hosting platform | The "deploy" worker just writes a URL string. No Vercel/Netlify/Cloudflare integration. | Websites are not actually hosted | Hosting integration not built | 1-2 weeks |

---

## Low Issues

| # | Issue | Description | Impact | Root Cause | Effort |
|---|-------|-------------|--------|------------|--------|
| L1 | PII in JWT payload | Email stored in JWT token. Unnecessary data exposure if token is logged. | Minor privacy concern | Minimal JWT payload design | 0.5 hour |
| L2 | No test suite | `tests/` directory is empty. Vitest configured but no tests exist. | Zero test coverage, regression risk | Tests were not written | 3-5 days |
| L3 | No Prisma migrations | Only `schema.prisma` exists. No migration files. Schema was pushed directly with `db push`. | Schema drift between dev and prod | Migrations were skipped for speed | 1 day |
| L4 | Hardcoded deployment URL | `https://{websiteId}.startupos.app` — domain is hardcoded, not configurable. | Cannot change deployment domain without code change | Domain was assumed static | 0.5 day |
| L5 | No API versioning | Routes have no `/v1/` prefix. | Future breaking changes harder to manage | Deferred for simplicity | 1 day |
| L6 | `docker/` directory empty | Empty directory. Dockerfile exists at root. | Minor confusion | Docker config was simplified | 0 |
| L7 | mock-deliverables.json in root | Mock file in project root. | Clutter | Leftover from development | 0 |
| L8 | JWT secret in .env is weak | Current secret is `y...e-super-secret-jwt-key-change-in-production` (truncated/corrupted). | Weak JWT signing if used in production | Manual .env editing | 5 min |
