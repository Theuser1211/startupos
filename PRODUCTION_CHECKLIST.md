# StartupOS Production Checklist

## Critical

- [x] Signup works — fixed `signUp()` to pass `emailRedirectTo` so confirmation email links to callback handler
- [x] Login works — added user-friendly error messages for invalid credentials, email not confirmed, rate limit
- [x] Duplicate emails blocked — enforced by Supabase auth + UI catches 'already registered' error
- [x] Session persistence works — Supabase cookies + getSession() + onAuthStateChange
- [x] Blueprint generation works — fixed useEffect deps, added logging on save failure
- [x] Website generation works — cleaned up dead polling code, route pre-creates website record, Inngest stores spec on success
- [ ] Deploy works
- [ ] My Startups page works
- [ ] Public pages work
- [ ] Auth routes protected
- [ ] No API key leaks

## High

- [ ] Job queue
- [ ] Email notifications
- [ ] Error logging
- [ ] Admin jobs dashboard

## Medium

- [ ] Profile page
- [ ] Settings page
- [ ] Billing page