# StartupOS Production QA Report

## Environment

| Property | Value |
|---|---|
| **Frontend** | https://startupos-black.vercel.app |
| **Backend** | https://startupos-backend-production.up.railway.app |
| **Test Date** | 2026-06-25 |
| **Viewports Tested** | Desktop 1440x900, Tablet 768x1024, Mobile 390x844 |
| **Test Account** | `qa-test-1748266600@startupos-test.com` |
| **Startup ID** | `25212f62-d968-4749-b882-d0c8ed3e95f9` |
| **Blueprint ID** | `576a2b88-0a59-4d9f-91b7-1b00ed6f25c3` |

---

## Functional Results

### 1. Create Account ✅
- **Endpoint:** `POST /auth/register`
- **Status:** 201 Created
- **Response:** User object + JWT token
- **Console errors:** 0

### 2. Sign In ✅
- **Status:** 200 OK, redirects to `/workspace`
- **Console errors:** 0
- **Session:** Redirected correctly post-login

### 3. Create Startup / Interview Flow ⚠️
- **Interview:** 5 steps completed successfully
- **Startup created:** `POST /startups` → 201
- **Issues:** Radix UI dropdown poppers intercept pointer events on Continue buttons, requiring Escape-to-dismiss workaround. UX friction.

### 4. Blueprint Generation ✅
- **Endpoint:** `POST /blueprints/generate`
- **Status:** 200 OK
- **Duration:** ~2s
- **Output:** `SocialBloom` — AI-powered social media management platform
- **Content:** Name, roadmap, industry, solution, tech stack, features, monetization, target audience, competitors
- **Prompt sent:**
  ```json
  {"startupId":"...","prompt":"Startup Idea: A platform that helps small businesses manage their social media presence with AI-generated content and scheduling\nStage: Ideation — just an idea, no product yet\nIndustry: FinTech\nTarget Customer: Small Businesses (B2B, <50 employees)\nBusiness Model: Subscription (monthly/yearly per seat)\nPrice Range: $10 – $50/mo\nBiggest Problem: Too hard to find / access — Access & availability"}
  ```

### 5. Workspace ✅
- **URL:** `/workspace?id=...`
- **Status:** Loaded successfully
- **Tabs (all working):** Overview, Verdict, Brand, ICP, Revenue, Roadmap, Roast
- **Company name:** SocialBloom
- **Console errors:** 0

### 6. Website Generation ❌ (CRITICAL)
- **Endpoint:** `POST /websites/generate`
- **Status:** 500 Internal Server Error
- **Duration:** 141,845ms (~2.4 minutes)
- **Console errors:** 1 (`Failed to load resource: 500`)
- **Response body:**
  ```
  All AI providers failed (tried 10 providers)
  ```
- **Failure chain:**
  | Provider | Model | Error |
  |---|---|---|
  | groq-2 | llama-3.3-70b-versatile | Validation failed — missing `pages`, `theme`, `components` in response |
  | groq-1 | llama-3.3-70b-versatile | Same validation failure |
  | groq-3 | llama-3.3-70b-versatile | Same validation failure |
  | groq-1 | llama-3.3-70b-versatile | 429 Rate limited (retry after 33s) |
  | nim-1 | nvidia-nemotron-nano-9b-v2 | Validation failed — malformed response |
  | nim-2 | nvidia-nemotron-nano-9b-v2 | Timeout after 60s |
  | openrouter-1 | openai/gpt-4o | 402 Payment Required — insufficient credits for 8192 tokens |
  | openrouter-1 | openai/gpt-4o | 402 (retry) |
  | openrouter-1 | openai/gpt-4o | 402 (retry) |
  | openrouter-1 | openai/gpt-4o | 402 (retry) |

- **UI handling:** Shows "Generation Failed" with "Try Again" button ✅

### 7. Competitors Page ❌
- **URL:** `/competitors?startupId=...`
- **Page renders:** "Competitor Intelligence" heading loads
- **API call:** `GET /competitors/:startupId` → **404 Not Found (3 requests)**
- **Console errors:** 3 (all 404)

### 8. Brief Page ❌
- **URL:** `/workspace/brief?id=...` → 404 Not Found
- **Status:** Page does not exist

### 9. Dashboard / My Startups ⚠️
- **URL:** `/blueprints`
- **Status:** Page loads with "My Startups" and "A Platform" entry
- **Redirect:** `/dashboard` redirects to `/blueprints` (misleading route)
- **Note:** `POST /blueprints/generate` worked but the generated blueprint response suggests the startup name was parsed as "A Platform" from the first words of the description, rather than intelligently extracted.

### 10. Deployment Flow ❌
- **URL:** `/deploy?id=...` → 404 Not Found
- **Status:** Feature not implemented

### 11. Logout / Login Persistence ✅
- **Logout:** Clears session, shows "Sign In" link on homepage
- **Login:** Redirects to `/workspace`, all data intact
- **Refresh after 2min:** Session persists, workspace loads correctly
- **Console errors:** 0

---

## Network Failures

| # | Method | URL | Status | Duration | Notes |
|---|---|---|---|---|---|
| 1 | POST | `/websites/generate` | 500 | 141,845ms | All AI providers failed |
| 2 | GET | `/competitors/:startupId` | 404 | ~200ms | Endpoint not implemented (x3) |
| 3 | GET | `/workspace/competitors` | 404 | ~200ms | Wrong route |
| 4 | GET | `/workspace/brief` | 404 | ~200ms | Route not found |
| 5 | GET | `/deploy` | 404 | ~200ms | Route not found |

## Console Errors

| Total Errors | Source |
|---|---|
| 1 | `websites/generate` → 500 |
| 3 | `competitors/:id` → 404 (triple request) |
| 1 | `/deploy` → 404 |

**Total: 5 console errors across all pages tested.**

No uncaught exceptions, TypeScript errors, React errors, or runtime crashes.

## API Failures

| Endpoint | Method | Status | Failure Rate |
|---|---|---|---|
| `/health` | GET | 200 | 0% |
| `/admin/providers` | GET | 200 | 0% |
| `/auth/register` | POST | 201 | 0% |
| `/auth/login` | POST | 200 | 0% |
| `/startups` | POST | 201 | 0% |
| `/blueprints/generate` | POST | 200 | 0% |
| `/websites/generate` | POST | 500 | **100%** (1/1) |
| `/competitors/:id` | GET | 404 | **100%** (3/3) |

## Provider Health (Critical)

```
google-1:      cooldown  reqs=2  fails=2
google-2:      cooldown  reqs=2  fails=2
google-3:      cooldown  reqs=2  fails=2
groq-1:        cooldown  reqs=6  fails=4
groq-2:        cooldown  reqs=3  fails=3
groq-3:        cooldown  reqs=3  fails=3
nim-1:         cooldown  reqs=3  fails=3
nim-2:         cooldown  reqs=4  fails=4
openrouter-1:  healthy    reqs=53 fails=53  ← 100% failure (402 Payment Required)
```

**9/9 providers are effectively non-functional.** The only "healthy" provider (openrouter-1) has a 100% failure rate.

---

## Performance Observations

| Operation | Duration | Verdict |
|---|---|---|
| Auth register | ~800ms | ✅ Good |
| Blueprint generation | ~2s | ✅ Fast |
| Website generation | 141.8s | ❌ Failed |
| Page load (initial) | ~1.5s | ✅ Good |
| Workspace tab switch | ~500ms | ✅ Good |
| Page refresh | ~1.2s | ✅ Good |

## Responsive Audit

| Viewport | ScrollWidth | Viewport | Overflow | Notes |
|---|---|---|---|---|
| Desktop 1440x900 | 1436px | 1440px | ❌ No | ✅ Clean |
| Tablet 768x1024 | 764px | 768px | ❌ No | ✅ Clean |
| Mobile 390x844 | 386px | 390px | ❌ No | ✅ Clean |

All three viewports are free of horizontal overflow. Layout collapses gracefully:
- Desktop: Full navbar, multi-column grids
- Tablet: Hamburger menu appears, grids collapse to 2 columns
- Mobile: Single column, stacked layout, hamburger menu active

## Visual Defects

- **Radix UI popper overlay** intercepts pointer events on Continue buttons during interview flow. Users must click outside or press Escape to dismiss dropdown before proceeding.
- **Competitors page:** Renders heading but shows blank content area (API 404).
- **Deploy page:** 404, no redirect or fallback.
- **Brief page:** 404.

## Security Findings

- **Auth tokens:** JWT-based, sent via `Authorization: Bearer` header ✅
- **Token expiry:** JWT shows `iat`/`exp` claims (iat=1782394739, exp=1782999539 = ~7 days) ✅
- **Password policy:** Min 6 characters enforced at client side ✅
- **API rate limiting:** `x-ratelimit-limit: 100` headers present ✅
- **CORS:** Properly scoped to `https://startupos-black.vercel.app` ✅
- **Sensitive data in logs:** JWT tokens visible in request headers during testing (standard browser behavior) — no secrets in error messages ✅
- **No auth bypass found:** Protected routes redirect to sign in when unauthenticated ✅

## Accessibility Findings

- **Skip to content link:** Present on all pages ✅
- **Form labels:** Present on all form fields ✅
- **ARIA roles:** Used throughout (tab, combobox, option, alert) ✅
- **Color contrast:** Appears adequate (dark mode available) ✅
- **Alt text:** Images have alt text ✅
- **Keyboard navigation:** Tabs and forms navigable via keyboard ⚠️ (dropdown overlay issue affects keyboard flow)

---

## Screenshots Captured

| File | Page |
|---|---|
| `homepage.png` | Homepage (first visit, signed in state) |
| `homepage-desktop-1440.png` | Homepage at 1440px |
| `homepage-tablet-768.png` | Homepage at 768px |
| `homepage-mobile-390.png` | Homepage at 390px |
| `interview-start.png` | Interview flow start |
| `blueprint-ready.png` | "Your Blueprint is Ready" |
| `workspace-loaded.png` | Workspace Overview tab |
| `workspace-mobile-390.png` | Workspace at 390px |
| `workspace-verdict-desktop-1440.png` | Verdict tab |
| `workspace-brand-desktop-1440.png` | Brand tab |
| `workspace-icp-desktop-1440.png` | ICP tab |
| `workspace-revenue-desktop-1440.png` | Revenue tab |
| `workspace-roadmap-desktop-1440.png` | Roadmap tab |
| `workspace-roast-desktop-1440.png` | Roast tab |
| `website-generation-failed.png` | "Generation Failed" error state |
| `competitors-page.png` | Competitors page (blank due to 404) |
| `blueprints-page.png` | My Startups page |

---

## Critical Issues

### P0 — Website Generation Broken (All Providers Failing)

**Root Cause:** All AI providers in the failover chain produce unrecoverable responses:
1. **Groq (Llama 3.3 70B):** Returns valid JSON but fails Zod schema validation — the `WebsiteSpecResultSchema` requires `pages`, `theme`, and `components` arrays which the model omits. The model's output doesn't match the expected schema.
2. **NVIDIA Nim:** Either times out (60s) or returns malformed JSON that fails validation.
3. **OpenRouter (GPT-4o):** Returns 402 Payment Required — insufficient credits for 8192 max_tokens.

**Impact:** Users cannot generate websites, which is a core feature.

### P1 — OpenRouter Configuration Error

**Root Cause:** The OpenRouter API key has insufficient credits. 53/53 requests have failed with 402. The `maxTokens` parameter (8192) exceeds the account's token budget.

**Impact:** All requests routed to OpenRouter fail instantly, consuming failover slots without serving useful responses.

### P1 — Competitors API Not Implemented

**Root Cause:** `GET /competitors/:startupId` returns 404. The competitors page renders the UI but cannot load data.

**Impact:** Feature is broken despite being linked from the workspace.

### P2 — Interview Flow UX: Radix Popper Overlay Blocks Continue

**Root Cause:** When a dropdown/select is used in the interview form, the Radix UI popper content wrapper stays mounted and intercepts pointer events on the Continue button. Users must manually dismiss the dropdown before proceeding.

**Impact:** Friction in the core onboarding flow.

### P3 — Missing Routes (Deploy, Brief)

**Root Cause:** `/deploy` and `/workspace/brief` return 404. These may be planned features not yet implemented, but there is no redirect or placeholder UI.

---

## Root Cause Analysis

The primary failure mode is **AI provider misconfiguration**:

1. **Schema mismatch:** The `WebsiteSpecResultSchema` expects a strict JSON structure (`pages[]`, `theme{}`, `components[]`). The Groq Llama 3.3 model does not consistently produce this shape, leading to 100% validation failure.

2. **Token budget exhaustion:** OpenRouter's free tier credits are depleted. The 8192 `maxTokens` request exceeds the remaining balance (can only afford 3701 tokens).

3. **No working fallback:** With Google API keys failing (cooldown), Groq failing validation, Nim timing out, and OpenRouter out of credits, the failover chain exhausts all 10 candidates with zero successful calls.

---

## Launch Recommendation

**VERDICT: NOT READY**

The core AI-powered features (website generation, competitor intelligence) are non-functional due to AI provider failures. The blueprint generation works, but the downstream features that depend on it are broken. Users cannot complete the primary workflow (interview → blueprint → website).

**To reach READY status, the team must:**

1. Fix OpenRouter API key or reduce max_tokens from 8192 to ≤3701.
2. Fix Groq model prompt/schema alignment so Llama 3.3 produces valid `WebsiteSpecResultSchema` output.
3. Implement the competitors API endpoint.
4. Add proper 404 handling or redirect for unimplemented routes (deploy, brief).
5. Fix Radix UI dropdown overlay blocking Continue button clicks in interview flow.
6. Add proactive provider health monitoring to surface failures before users encounter them.
