# StartupOS Production Checklist

## Critical

- [x] Signup works — fixed `signUp()` to pass `emailRedirectTo` so confirmation email links to callback handler
- [x] Login works — added user-friendly error messages for invalid credentials, email not confirmed, rate limit
- [x] Duplicate emails blocked — enforced by Supabase auth + UI catches 'already registered' error
- [x] Session persistence works — Supabase cookies + getSession() + onAuthStateChange
- [x] Blueprint generation works — fixed useEffect deps, added logging on save failure
- [x] Website generation works — cleaned up dead polling code, route pre-creates website record, Inngest stores spec on success
- [x] Deploy works — validates WebsiteSpec, verifies ownership, renders to HTML, creates Vercel deployment, polls for readiness
- [x] My Startups page works — lists blueprints, open/resume, delete, profile menu, auth guard
- [x] Public pages work — public blueprint page with SSR, SEO, 404 handling
- [x] Auth routes protected — every API route (except webhooks/public-blueprints) checks auth via `getUser()`
- [x] No API key leaks — removed `NEXT_PUBLIC_GOOGLE_API_KEY` from .env.local (unused, client-exposed), updated DEPLOYMENT.md

## High

- [ ] Job queue
- [ ] Email notifications
- [ ] Error logging
- [ ] Admin jobs dashboard

## Medium

- [ ] Profile page
- [ ] Settings page
- [ ] Billing page