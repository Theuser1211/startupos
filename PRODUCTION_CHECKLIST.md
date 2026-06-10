# StartupOS Production Checklist

## Critical

- [x] Signup works — fixed `signUp()` to pass `emailRedirectTo` so confirmation email links to callback handler
- [x] Login works — added user-friendly error messages for invalid credentials, email not confirmed, rate limit
- [ ] Duplicate emails blocked
- [ ] Session persistence works
- [ ] Blueprint generation works
- [ ] Website generation works
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