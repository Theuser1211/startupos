# StartupOS Bug Tracker

Generated: 2026-06-24
Scope: Full repository audit (backend + frontend)

## Severity Legend

| Severity | Meaning |
|----------|---------|
| BLOCKER | Prevents core flow, data loss, security breach |
| MAJOR | Significant degradation, non-blocking defect |
| MINOR | Cosmetic, low-impact, nice-to-have |

---

## BUG-001: React Hook Order Violations (11+ Components)

- **Severity:** BLOCKER
- **Priority:** 1 (Preventing founder journey completion)
- **Reproduction Steps:**
  1. Navigate to `/blueprints`, `/workspace`, `/interview`, or any workspace tab
  2. Interact with the page (scroll, navigate, toggle)
  3. Observe runtime React errors or blank screens
- **Expected Behavior:** Components render without hook-order warnings
- **Actual Behavior:** Multiple files declare hooks (`useEffect`, `useState`, `useCallback`) after conditional returns or in wrong order, violating Rules of Hooks:
  - `app/blueprints/page.tsx` — `fetchBlueprints` declared after `useEffect`
  - `app/admin/page.tsx` — `fetchAdminData` declared after `useEffect`
  - `app/workspace/page.tsx` — ref mutation during render
  - `components/landing/hero.tsx` — `Math.random()` during render
  - `components/workspace/logo-tab.tsx` — `setState` inside effect
  - `components/workspace/website-tab.tsx` — ref/order + `any` usage
  - `components/workspace/verdict-tab.tsx` — unescaped entities
  - `lib/startup/blueprint-context.tsx` — `setState` inside effect
  - `lib/ai/gemini.ts` — explicit `any`
  - `components/workspace/website-tab.tsx` — `loadDeploymentHistory`/`loadCustomDomains` after `useEffect`
- **Root Cause Hypothesis:** Missing lint enforcement + rapid feature development without strict React hook rules
- **Status:** Open (documented in `apps/frontend/TODO.md`)

---

## BUG-002: XSS Vulnerability in Generated Website HTML

- **Severity:** BLOCKER
- **Priority:** 1 (Security)
- **Reproduction Steps:**
  1. Generate a website blueprint with a startup name or description containing `<script>alert('xss')</script>`
  2. Deploy the generated website
  3. Visit the deployed site
- **Expected Behavior:** AI-generated HTML should be sanitized/escaped before serving
- **Actual Behavior:** AI-generated HTML content is stored and served verbatim — no DOMPurify, no escaping, no CSP headers. The `renderer` (`apps/backend/src/services/renderer/index.ts`) passes raw HTML from AI directly into `buildDeployFiles` (`apps/backend/src/services/deploy/builder.ts:8-9`).
- **Root Cause Hypothesis:** No sanitization layer between AI generation and storage/deployment. Validator only checks for markdown fences and minimum length.
- **Status:** Open (documented in `apps/frontend/TODO.md` Phase 1)

---

## BUG-003: Auth Token — No Refresh Mechanism

- **Severity:** BLOCKER
- **Priority:** 3 (Authentication)
- **Reproduction Steps:**
  1. Sign in (receives JWT with 7-day expiry)
  2. Close tab or let session idle
  3. After token expiry, all API calls return 401
  4. User is forced to sign in again
- **Expected Behavior:** Auth tokens should be refreshable via a refresh token or silent re-auth
- **Actual Behavior:** `apps/backend/src/middleware/auth.ts:11-22` — only validates on every request, no refresh token endpoint. `apps/frontend/lib/api/auth.ts` — `getCurrentUser` reads from localStorage JWT, no `/auth/refresh` call.
- **Root Cause Hypothesis:** Auth implementation is minimal MVP — missing refresh token flow
- **Status:** Open

---

## BUG-004: Razorpay Webhook Does Not Fail-Closed

- **Severity:** BLOCKER
- **Priority:** 1 (Data loss / Security)
- **Reproduction Steps:**
  1. Deploy without `RAZORPAY_WEBHOOK_SECRET` configured
  2. Send a POST to the webhook endpoint
  3. Webhook processes the request without signature verification
- **Expected Behavior:** Webhook should reject requests when secret is missing
- **Actual Behavior:** The webhook handler does not validate/check for the secret before processing — no fail-closed guard
- **Root Cause Hypothesis:** Webhook handler was written before env guard was added
- **Status:** Open (documented in `apps/frontend/TODO.md` Phase 1)

---

## BUG-005: In-Memory Rate Limiting — Not Distributed

- **Severity:** MAJOR
- **Priority:** 1 (Preventing journey flow)
- **Reproduction Steps:**
  1. Deploy with multiple server instances
  2. One instance exhausts its rate limit
  3. Requests route to another instance which has a fresh counter
  4. Rate limiting becomes ineffective
- **Expected Behavior:** Rate limits should be shared across all instances via Redis
- **Actual Behavior:** `apps/backend/src/server.ts:42-45` uses `@fastify/rate-limit` with in-memory store (default). Rate limit state is lost on restart and not shared across instances.
- **Root Cause Hypothesis:** Chose simple in-memory for MVP, never migrated to distributed store
- **Status:** Open (documented in `apps/frontend/TODO.md` Phase 2)

---

## BUG-006: No Request Body Size Limits

- **Severity:** MAJOR
- **Priority:** 1 (Security / Preventing journey)
- **Reproduction Steps:**
  1. POST a 100MB JSON payload to any API endpoint
  2. Server attempts to parse the full payload
  3. Memory pressure, potential OOM
- **Expected Behavior:** Fastify should reject oversized payloads (e.g. >1MB) with 413
- **Actual Behavior:** No `bodyLimit` configured in `apps/backend/src/server.ts:32-34`
- **Root Cause Hypothesis:** Not configured during initial Fastify setup
- **Status:** Open (documented in `apps/frontend/TODO.md` Phase 1)

---

## BUG-007: Blueprint Content Can Be Null/Empty at Retrieval

- **Severity:** MAJOR
- **Priority:** 2 (Data loss)
- **Reproduction Steps:**
  1. Generate a blueprint via the API
  2. Retrieve it via `GET /blueprints/:id`
  3. API returns `blueprint.content` as `null` or empty object
- **Expected Behavior:** Blueprint content should always be a valid non-empty object
- **Actual Behavior:** The E2E test (`apps/backend/tests/blueprint-retrieval-e2e.ts:178-182`) explicitly catches this: `throw new Error("API returned blueprint.content as undefined/null")`. The database stores content as `Prisma.InputJsonValue` (JSON column) — if serialization rounds `undefined` to `null`, the retrieval breaks.
- **Root Cause Hypothesis:** `JSON.parse(JSON.stringify(blueprint))` in `apps/backend/src/queue/worker.ts:109` can strip certain fields, and Prisma JSON columns may coerce to null
- **Status:** Open

---

## BUG-008: AI Generation — Heavy Fallback Template Usage

- **Severity:** MAJOR
- **Priority:** 4 (AI generation)
- **Reproduction Steps:**
  1. Generate a website for any startup
  2. Inspect the generated pages
  3. 40-80% of pages use fallback templates instead of AI-generated content
- **Expected Behavior:** AI provider should generate all pages with custom content
- **Actual Behavior:** Last verification run (`test-output/verification-report.json`) shows 6 warnings — 4/4 test startups had fallback pages. BuildSite: 4/5 pages fallback. ComplianceAI: 3/5 pages fallback. The `renderWebsite` function in `apps/backend/src/services/renderer/index.ts:83-87` uses `renderHomeFallback` and `renderGenericFallback` — no AI provider path is attempted for page-level rendering.
- **Root Cause Hypothesis:** Page-level HTML generation via AI was implemented but the renderer routes directly to fallback functions without attempting the AI provider
- **Status:** Open

---

## BUG-009: Vercel Deployment Error Leaks API Response

- **Severity:** MAJOR
- **Priority:** 5 (Deployments)
- **Reproduction Steps:**
  1. Deploy website with invalid VERCEL_TOKEN
  2. Vercel API returns error with response body
  3. Error thrown propagates full Vercel error text to client
- **Expected Behavior:** Error messages should be sanitized before reaching the client
- **Actual Behavior:** `apps/backend/src/services/deploy/vercel.ts:54` throws `new Error(\`Vercel deployment failed (${response.status}): ${errorBody}\`)`. The full error body (which may contain API internal details) propagates to the client in `deployment.handler.ts:139`.
- **Root Cause Hypothesis:** Error was constructed for debugging but never wrapped/sanitized for production
- **Status:** Open

---

## BUG-010: Mock Deployment When VERCEL_TOKEN Missing

- **Severity:** MAJOR
- **Priority:** 5 (Deployments)
- **Reproduction Steps:**
  1. Delete or unset `VERCEL_TOKEN`
  2. Deploy a website
  3. System reports success with a fake `https://<websiteId>.startupos.app` URL
- **Expected Behavior:** Deployment should either fail fast with a clear error or queue for later deployment
- **Actual Behavior:** Both `apps/backend/src/queue/worker.ts:380-397` and `apps/backend/src/modules/deployments/deployment.handler.ts:163-179` silently fall back to mock URLs when `VERCEL_TOKEN` is not set. No warning in the response body, no admin notification.
- **Root Cause Hypothesis:** Mock mode was added for local dev but never gated behind `NODE_ENV=development`
- **Status:** Open

---

## BUG-011: No CI/CD Pipeline

- **Severity:** MAJOR
- **Priority:** 1 (Quality assurance)
- **Reproduction Steps:**
  1. Any developer pushes code
  2. No automated tests run
  3. Broken code can merge unnoticed
- **Expected Behavior:** GitHub Actions or equivalent should run lint + test on every push/PR
- **Actual Behavior:** Zero CI configuration files exist — no `.github/workflows/`, no `.circleci/`, no CI config. Tests exist but are only runnable manually.
- **Root Cause Hypothesis:** Repository was set up by a solo founder who hasn't added CI yet
- **Status:** Open

---

## BUG-012: Autosave Has No Conflict Handling

- **Severity:** MAJOR
- **Priority:** 2 (Data loss)
- **Reproduction Steps:**
  1. Open the same startup in two browser tabs
  2. Edit in Tab A, save
  3. Edit in Tab B, save
  4. Tab A's changes are silently overwritten
- **Expected Behavior:** Autosave should use optimistic concurrency with `updated_at` versioning
- **Actual Behavior:** No versioning, no conflict detection, last-write-wins
- **Root Cause Hypothesis:** Autosave was built without considering concurrent edits
- **Status:** Open (documented in `apps/frontend/TODO.md` Phase 2)

---

## BUG-013: Duplicate `frontend/frontend/` Directory

- **Severity:** MAJOR
- **Priority:** 1 (Build/CI confusion)
- **Reproduction Steps:**
  1. Run `npm test` in the monorepo
  2. All frontend tests execute twice
  3. Developers editing one copy may not update the other
- **Expected Behavior:** Single source of truth for frontend code
- **Actual Behavior:** `apps/frontend/frontend/` is an exact copy of `apps/frontend/` — includes its own `package.json`, `vitest.config.ts`, `__tests__/`, and `scripts/`. Both are registered as npm workspaces.
- **Root Cause Hypothesis:** Likely a misconfigured monorepo setup or accidental copy
- **Status:** Open

---

## BUG-014: Job Polling Without Exponential Backoff

- **Severity:** MAJOR
- **Priority:** 4 (AI generation)
- **Reproduction Steps:**
  1. Poll a long-running job (e.g., blueprint generation)
  2. Polling retries at fixed intervals until timeout
  3. Many rapid requests hit the server during long generations
- **Expected Behavior:** Poll interval should increase exponentially after each retry
- **Actual Behavior:** `apps/frontend/lib/api/jobs.ts:31` — `throw new Error("Job polling timed out")`. The polling implementation retries at a fixed interval until `JOB_TIMEOUT_MS` (default 600000ms / 10 min).
- **Root Cause Hypothesis:** Polling was implemented simply with a `while` loop, no backoff
- **Status:** Open

---

## BUG-015: AI Provider Errors May Leak Environment Variable Names

- **Severity:** MAJOR
- **Priority:** 4 (AI generation)
- **Reproduction Steps:**
  1. Trigger blueprint generation without any AI keys set
  2. Error message lists all possible env var names to configure
- **Expected Behavior:** Generic error message like "No AI provider available"
- **Actual Behavior:** `apps/backend/src/services/ai/provider.ts:906` — `throw new Error("No AI provider configured. Set GOOGLE_API_KEY_1, GROQ_API_KEY, NIM_API_KEY_1, OPENROUTER_API_KEY, or FREELLM_API_KEY.")` — leaks the exact environment variable names to the client.
- **Root Cause Hypothesis:** Error was written for developer convenience, not hardened for production
- **Status:** Open

---

## BUG-016: No Rate Limiting on Login Endpoint

- **Severity:** MAJOR
- **Priority:** 3 (Authentication)
- **Reproduction Steps:**
  1. Send 10,000 login attempts with wrong passwords
  2. All attempts are processed without delay or block
- **Expected Behavior:** Login should rate-limit per IP after 5 failures
- **Actual Behavior:** `apps/backend/src/modules/auth/auth.handler.ts:31-48` — the login handler has no IP-based or account-lockout protection. The global rate limit (100/min) is too permissive for brute force prevention.
- **Root Cause Hypothesis:** Auth hardening was deferred
- **Status:** Open (related to TODO.md Phase 1 security)

---

## BUG-017: Interview Page — Toast on Error Then Redirect

- **Severity:** MAJOR
- **Priority:** 2 (Data loss)
- **Reproduction Steps:**
  1. Complete founder interview
  2. Blueprint generation fails
  3. Toast shows error briefly
  4. Page immediately redirects to `/workspace` (empty state)
  5. User loses all interview input
- **Expected Behavior:** On failure, stay on the interview page and allow retry
- **Actual Behavior:** `apps/frontend/app/interview/page.tsx:175-183` — catches error, shows toast, then redirects to `/workspace`. The `localStorage.setItem("startupos-founder", JSON.stringify(data))` at line 161 is set before the API call — but the user is now on an empty workspace.
- **Root Cause Hypothesis:** Error handling was added as an afterthought — redirect should only happen on success
- **Status:** Open

---

## BUG-018: No Loading Skeletons — Only Spinners

- **Severity:** MINOR
- **Priority:** 6 (UX issues)
- **Reproduction Steps:**
  1. Navigate to any page with loading state
  2. Static spinner is shown during loading
  3. Content appears suddenly when loaded
- **Expected Behavior:** Loading skeletons should match the page layout to prevent layout shift
- **Actual Behavior:** All loading states use centered spinner components (see `app/workspace/page.tsx:80-94`, `app/blueprints/page.tsx:67-74`). No skeleton matching the content layout.
- **Root Cause Hypothesis:** No design system for loading skeletons was implemented
- **Status:** Open (documented in TODO.md Phase 3)

---

## BUG-019: Generated Pricing Shows Placeholder `$XXX`

- **Severity:** MINOR
- **Priority:** 6 (UX issues)
- **Reproduction Steps:**
  1. Run the QA generation scripts
  2. Inspect `qa-bp-6.json` and `qa-bp-9.json`
  3. Pricing field contains `"$XXX"` as placeholder value
- **Expected Behavior:** Pricing should use real monetization data from the blueprint or be omitted
- **Actual Behavior:** Two QA output files contain `"pricing": "variable/mo (starter) to $XXX (growth)"` and `"pricing": "1.5%/mo (starter) to $XXX (growth)"`. The AI is generating placeholder `$XXX` instead of real pricing data.
- **Root Cause Hypothesis:** AI model does not have real pricing data for the startup and defaults to placeholder
- **Status:** Open

---

## BUG-020: Onboarding Consistency & Missing Analytics

- **Severity:** MINOR
- **Priority:** 6 (UX issues)
- **Reproduction Steps:**
  1. Go through the founder interview flow
  2. Observe loading state transitions and skeleton consistency
  3. Try to find user behavior analytics or feedback mechanisms
- **Expected Behavior:** Onboarding should have consistent loading patterns; user actions should be tracked; feedback should be captured
- **Actual Behavior:** `apps/frontend/lib/contexts/auth-context.tsx:39-43` — `getCurrentUser` is sync (localStorage call) but wrapped in `useEffect` with loading state, causing a flash. No analytics SDK integration. No feedback widget. No error tracking (Sentry, etc.).
- **Root Cause Hypothesis:** Analytics and onboarding polish were deferred to Phase 3
- **Status:** Open (documented in `apps/frontend/TODO.md` Phase 3)

---

## Summary

| Severity | Count | IDs |
|----------|-------|-----|
| BLOCKER | 4 | BUG-001, BUG-002, BUG-003, BUG-004 |
| MAJOR | 14 | BUG-005, BUG-006, BUG-007, BUG-008, BUG-009, BUG-010, BUG-011, BUG-012, BUG-013, BUG-014, BUG-015, BUG-016, BUG-017, BUG-018 (escalated) |
| MINOR | 2 | BUG-019, BUG-020 |

### Priority-Action Items

1. **BUG-001** — Run `npm run lint` to surface all React hook violations; fix in order: workspace page → blueprint-context → website-tab
2. **BUG-002** — Add DOMPurify sanitization in `renderWebsite` before persisting generated HTML
3. **BUG-003** — Implement `/auth/refresh` endpoint and silent token refresh in the auth context
4. **BUG-011** — Add a GitHub Actions workflow running `npm test` on push/PR
5. **BUG-008** — Route page generation through the AI provider chain instead of direct fallback
