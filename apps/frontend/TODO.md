# StartupOS CTO Audit & Fix Roadmap

## Phase 0 — Stabilize CI (lint/test pass)
- [ ] Fix React hook errors in:
  - [ ] app/blueprints/page.tsx (fetchBlueprints declared after useEffect call)
  - [ ] app/admin/page.tsx (fetchAdminData declared after useEffect call)
  - [ ] app/workspace/page.tsx (ref mutation during render)
  - [ ] components/landing/hero.tsx (Math.random during render)
  - [ ] components/workspace/logo-tab.tsx (setState inside effect)
  - [ ] components/workspace/website-tab.tsx (ref/order + explicit any usage)
  - [ ] components/workspace/verdict-tab.tsx (unescaped entities)
  - [ ] lib/startup/blueprint-context.tsx (setState inside effect)
  - [ ] lib/ai/gemini.ts (explicit any)
  - [ ] scripts/test-gemini-blueprint.ts (explicit any)
  - [ ] components/workspace/website-tab.tsx (loadDeploymentHistory/loadCustomDomains declared after useEffect)
- [ ] Run `npm run lint` and `npm test`

## Phase 1 — Security hardening (safe fixes)
- [ ] Escape/sanitize all dynamic strings in generated website HTML (prevent XSS)
- [ ] Enforce OpenRouter fetch timeout with AbortController
- [ ] Add request body size limits for JSON endpoints
- [ ] Fail-closed Razorpay webhook when secret missing

## Phase 2 — Product hardening & reliability
- [ ] Move in-memory rate limiting to distributed store
- [ ] Add plan gating enforcement in API routes
- [ ] Improve autosave conflict handling with versioning/updated_at

## Phase 3 — Investor-ready product gaps
- [ ] Verify onboarding flow and loading/skeleton consistency
- [ ] Add analytics + feedback capture
- [ ] Add sharing/export flows


