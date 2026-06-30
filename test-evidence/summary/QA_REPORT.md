# QA Report — StartupOS E2E Audit

**Date:** 2026-06-29T15:19:56.147Z
**URL:** http://localhost:3000
**Browser:** Chromium (visible)
**Viewport:** 1280x720 (desktop), 390x844 (mobile)

---

## Test Results

### Guest Flow: PASS ✅

| Test | Result |
|------|--------|
| Landing page loads | PASS ✅  |
| Blueprint generated & workspace loaded | PASS ✅  |
| Workspace has content | PASS ✅  |
| Website generation initiated | PASS ✅  |
| Workspace survives refresh | PASS ✅  |
| dashboard page renders (guest) | PASS ✅  |
| brief page renders (guest) | PASS ✅  |
| competitors page renders (guest) | PASS ✅  |
| blueprints page renders (guest) | PASS ✅  |

### Authenticated Flow: PARTIAL ⚠️

| Test | Result |
|------|--------|
| Sign up | PASS ✅ |
| Login | PASS ✅ |
| Authenticated blueprint generated | FAIL ❌ |
| Re-login | PASS ✅ |
| workspace survives hard refresh | PASS ✅ |
| dashboard survives hard refresh | PASS ✅ |
| competitors survives hard refresh | PASS ✅ |
| brief survives hard refresh | PASS ✅ |
| blueprints survives hard refresh | PASS ✅ |
| Rapid tab switching no crash | PASS ✅ |

### Website Generation: 0/0 successful

| Test | Result | Duration |
|------|--------|----------|


### Stress Tests: PASS ✅

| Test | Result |
|------|--------|
| Rapid navigation | PASS ✅ |
| Double-click buttons | PASS ✅ |
| Back/forward spam | PASS ✅ |
| Clear localStorage mid-session | PASS ✅ |
| Refresh during loading | PASS ✅ |

### Mobile: PASS ✅

| Test | Result |
|------|--------|
| Mobile landing | PASS ✅ |
| Mobile signup | PASS ✅ |
| Mobile signin | PASS ✅ |
| Mobile interview | PASS ✅ |
| Mobile workspace | PASS ✅ |
| Mobile dashboard | PASS ✅ |
| Mobile blueprints | PASS ✅ |

### Console Audit: FAIL ❌

| Metric | Count |
|--------|-------|
| Page errors | 0 |
| Console errors | 3 |
| Network errors (5xx) | 3 |


**Console Errors:**
- Failed to load resource: the server responded with a status of 500 ()
- Failed to load resource: the server responded with a status of 500 ()
- Failed to load resource: the server responded with a status of 500 ()

**Network Errors:**
- https://startupos-backend-production.up.railway.app/websites/by-startup/guest-c84d8312-516a-46bc-aebd-825f5fce9d9b -> 500
- https://startupos-backend-production.up.railway.app/websites/by-startup/guest-c84d8312-516a-46bc-aebd-825f5fce9d9b -> 500
- https://startupos-backend-production.up.railway.app/websites/generate -> 500


---

## Summary

| Category | Status |
|----------|--------|
| Guest Flow | PASS ✅ |
| Authenticated Flow | PARTIAL ⚠️ |
| Website Generation | 0/0 |
| Stress Tests | PASS ✅ |
| Mobile | PASS ✅ |
| Console | FAIL ❌ |

**Total Tests:** 31
**Passed:** 30
**Failed:** 1

## Known Bugs

- Authenticated blueprint generated: Failed

## Screenshots

All screenshots saved in `test-evidence/` directory:
- `guest/` — Guest user flow screenshots
- `authenticated/` — Authenticated user flow screenshots
- `website-generation/` — Website generation run screenshots
- `refresh-tests/` — Post-refresh persistence screenshots
- `mobile/` — Mobile viewport screenshots
- `errors/` — Stress test and error screenshots

## Final Verdict

**NOT READY — Issues found ⚠️**

1 test(s) failed. Review screenshots in test-evidence/ for details.
