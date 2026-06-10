---
noteId: "20bb6c90633011f1938e5d9f7302402a"
tags: []

---

# StartupOS — Vercel Deployment Guide

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
- A [Supabase](https://supabase.com) project
- An [OpenRouter](https://openrouter.ai) account (free tier)

## Step 1: Environment Variables

Copy the template and fill in values:

```bash
cp .env.example .env.local
```

### Required Variables

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role (keep secret!) |
| `OPENROUTER_API_KEY` | [OpenRouter Keys](https://openrouter.ai/keys) |

### Optional Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay live key for payments |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (server only) |
| `NEXT_PUBLIC_SITE_URL` | Set to your production domain for OG tags |

## Step 2: Database Setup

Run the SQL migrations in `supabase/migrations/` in the Supabase SQL Editor:

1. `00001_blueprints.sql` — Creates the blueprints table
2. `00002_production_tables.sql` — Creates profiles, startups, generated_logos, generated_websites, subscriptions, usage_tracking, audit_logs

## Step 3: Auth Configuration

In Supabase Dashboard → Authentication → Settings:

1. **Site URL**: `https://your-app.vercel.app`
2. **Redirect URLs**: Add `https://your-app.vercel.app/auth/callback`
3. **Email Templates**: Copy HTML from `supabase/email-templates/` into each template type
4. **Security**: Enable "Confirm email" for new users

## Step 4: Deploy to Vercel

### Option A: Git Deploy (Recommended)

```bash
# Connect your GitHub repo to Vercel
# Vercel auto-detects Next.js configuration

# Set environment variables in Vercel Dashboard:
#   Project → Settings → Environment Variables
```

### Option B: CLI Deploy

```bash
vercel --prod
# Follow prompts, select existing project or create new
# Set env vars when prompted
```

## Step 5: Post-Deploy Verification

Run the production build locally first:

```bash
npm run build
```

After deploying, verify:

- [ ] Landing page loads at your domain
- [ ] `/auth/sign-in` redirects correctly
- [ ] Sign up flow sends confirmation email
- [ ] Interview flow generates a blueprint
- [ ] Workspace displays all tabs
- [ ] API routes return 200s
- [ ] No console errors in browser DevTools

## Production Configuration

### Security Headers

Configured in `next.config.ts`:
- `X-Frame-Options: DENY` — Prevents clickjacking
- `Strict-Transport-Security` — Enforces HTTPS
- `X-Content-Type-Options: nosniff` — MIME type protection
- `Referrer-Policy: strict-origin-when-cross-origin` — Privacy preserving

### Caching

- Static assets (SVG, images): 1-year immutable cache
- API routes: No caching (dynamic data)

### Monitoring

Add these to your Supabase project for production monitoring:
- [Supabase Logs](https://supabase.com/dashboard/project/_/logs) — API errors and auth events
- [Vercel Analytics](https://vercel.com/analytics) — Page views and performance

## Common Issues

### "Failed to load Supabase client"
→ Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### "Auth session not persisting"
→ Verify cookie settings in `lib/supabase/proxy.ts`
→ Ensure auth callback URL is configured in Supabase dashboard

### "OpenRouter returns 401"
→ Verify `OPENROUTER_API_KEY` is set in Vercel environment variables (not just `.env.local`)

### "Build fails with TypeScript errors"
→ Run `npx tsc --noEmit` locally first
→ Check for `any` type casts that should be explicit
