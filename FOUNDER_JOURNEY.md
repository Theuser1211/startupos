# StartupOS — Founder Journey Audit

> Audit date: 2026-06-19
> Testing the theoretical flow a founder would follow

---

## Journey Steps

### Step 1: User Signs Up
**Status: ✅ Works**

- `POST /auth/register` accepts email, password, name
- Creates user in Postgres with bcrypt-hashed password (12 rounds)
- Returns JWT token + user object (id, email, name, createdAt)
- JWT expires in 7 days

**Gaps:**
- No email verification
- No welcome email
- No password complexity rules (only min 8 chars)
- No rate limiting on registration (100 req/min global applies)

---

### Step 2: Creates Startup
**Status: ✅ Works**

- `POST /startups` accepts name (required), description, logo, industry (all optional)
- Creates startup record linked to user via userId
- Ownership check on all subsequent operations

**Gaps:**
- Cannot update startup after creation (no PATCH endpoint)
- No startup name uniqueness check (multiple startups with same name allowed)
- Logo is a URL string — no upload mechanism

---

### Step 3: Generates Blueprint
**Status: ✅ Works**

- `POST /blueprints/generate` accepts startupId + prompt
- Creates async job (BullMQ), returns jobId immediately (HTTP 202)
- Worker calls AI provider with fallback chain (FreeLLM → Groq → OpenRouter)
- AI response validated against Zod schema before DB write
- Blueprint stored as JSON in `Blueprint.content`
- Client polls `GET /jobs/:id` to check completion

**Gaps:**
- Cannot edit blueprint after generation (no PATCH endpoint)
- Cannot regenerate blueprint (existing blueprint blocks new generation)
- Prompt is required (10 min chars) — no "auto-generate" option
- No progress indication during generation (binary: pending → done)
- AI response may not match expected format for complex startups

**End-to-end verification:**
- Job creation: ✅ Idempotency guard prevents duplicate jobs
- AI call: ✅ Timeout (45s), fallback chain, Zod validation
- DB write: ✅ Blueprint created with startupId
- Job completion: ✅ Status updated to COMPLETED with blueprintId in result

---

### Step 4: Generates Website
**Status: 🟡 Partially Works**

- `POST /websites/generate` accepts startupId
- Checks that blueprint exists (required prerequisite)
- Creates async job, returns jobId
- Worker generates a `WebsiteSpec` (JSON describing pages, theme, components)
- Website record created with `status: "spec_generated"` and empty `content: {}`

**What's missing:**
- ❌ **No HTML/CSS/JS generation** — The "website" is just a JSON spec (page names, section types, theme colors)
- ❌ **No visual output** — Nothing a user can view or screenshot
- The `WebsiteSpec` is a design document, not a website
- `Website.content` is always `{}` — never populated

**Gap analysis:**
The pipeline has a missing step:
```
Blueprint → WebsiteSpec (✅ exists) → Rendered HTML/CSS/JS (❌ missing) → Deploy (⚠️ stub)
```

---

### Step 5: Deploys Website
**Status: 🟡 Partially Works**

- `POST /deployments/create` accepts websiteId
- Creates deployment record + job in a transaction
- Worker transitions: PENDING → BUILDING → LIVE
- Deployment URL set to `https://{websiteId}.startupos.app`

**What's missing:**
- ❌ **No actual deployment** — URL is a string interpolation, not a real hosted site
- ❌ **No hosting platform integration** — No Vercel, Netlify, Cloudflare SDK
- ❌ **No build step** — There are no files to deploy (Website.content is `{}`)
- ❌ **The URL returns 404** — `startupos.app` domain is not configured
- `DEPLOYING` status is never used (jumps from BUILDING to LIVE)

**Reality:** Deployment is a database operation, not a real deployment.

---

### Step 6: Gets Public URL
**Status: ❌ Broken**

- The deployment URL `https://{websiteId}.startupos.app` does not resolve
- No DNS configuration for `startupos.app` subdomain
- No static file hosting at that URL
- No public-facing routes in the API (all routes require authentication)

**Even if hosting were configured:**
- There is no HTML/CSS/JS to serve (content is `{}`)
- There is no public route handler
- No CORS/headers configured for public serving

---

### Step 7: Returns Later
**Status: 🟡 Partially Works**

- JWT token valid for 7 days — user can return within that window
- `GET /auth/me` verifies current session
- `GET /startups` returns all user's startups
- `GET /startups/:id` returns full startup with blueprint + websites + deployments

**Gaps:**
- ❌ After 7 days, token expires. No refresh mechanism. User must re-login
- No session management (can't see active sessions, can't revoke)
- No "remember me" flow beyond the 7-day JWT
- No browser session persistence guidance

---

## Journey Summary

| Step | Status | Blocker? |
|------|--------|----------|
| 1. Sign up | ✅ Works | No |
| 2. Create startup | ✅ Works | No |
| 3. Generate blueprint | ✅ Works | No |
| 4. Generate website | 🟡 Partial | **Yes — no visual website** |
| 5. Deploy website | 🟡 Partial | **Yes — no real hosting** |
| 6. Get public URL | ❌ Broken | **Yes — URL doesn't resolve** |
| 7. Return later | 🟡 Partial | Minor — forced re-login after 7 days |

---

## Critical Blocker

**The founder journey breaks at Step 4.** The AI pipeline generates a WebsiteSpec (a JSON description of what the website should look like), but there is no rendering step to convert that spec into actual HTML/CSS/JS. Without rendered output, there is nothing to deploy, nothing to host, and no public URL to share.

**The three missing links in the chain:**
1. **WebsiteSpec → HTML/CSS/JS** (rendering engine)
2. **HTML/CSS/JS → Hosting** (deployment to Vercel/Netlify/etc.)
3. **Hosting → Public URL** (DNS + serving)
