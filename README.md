# StartupOS

A tool that forces you to think through your startup idea before building it.

I kept starting projects and abandoning them after 72 hours. Usually because I jumped into building without thinking things through first. So I made a tool that walks me through a structured interview — market, users, business model — and gives me a blueprint to work from.

## Features

- **Verdict** — tells you if your idea is worth building
- **Website** — generates a landing page from your answers, deploy in one click
- **Brand** — mission, values, tone, colors, typography
- **ICP** — ideal customer profile: role, goals, pain points, objections
- **Revenue** — pricing model, funding, projections
- **Roadmap** — quarterly plan with status tracking
- **Competitors** — track competitors with snapshot history
- **Guest mode** — use the full flow without signing up

## Tech stack

Next.js 16, React 19, TypeScript, TailwindCSS v4, Fastify, Prisma, PostgreSQL, Gemini/OpenAI

## How to run locally

```bash
git clone https://github.com/yourusername/startupos.git
cd startupos

# Install all packages
npm install

# Backend (needs Supabase + AI keys)
cd apps/backend
cp .env.example .env  # fill in your keys
npm run dev

# Frontend (separate terminal)
cd apps/frontend
cp .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:3001`.

## Biggest bugs I fought

- **AI JSON parsing.** Providers timeout, return malformed JSON, or hallucinate fields. Built a multi-provider failover with cooldown + Zod validation on every response. Gemini once returned `"verdict": "your startup is bad"` as a string instead of an object. I still have nightmares.

- **Hydration errors.** The footer rendered the current year server-side, then React flipped when the client year didn't match. Fixed with `suppressHydrationWarning` and deferring dynamic values to client effects. 3 hours for a one-liner.

- **Sidebar race condition.** `useSearchParams().get("id")` returns null on first render after `router.push()`. Fixed with a `paramsReady` guard, `window.location.search` fallback, and localStorage persistence. 15 lines of code. 2 days to find.

- **Conditional form validation.** If "one-time" business model hid the price field, validation still checked it. Had to add `showIf` awareness to step validation.

- **TanStack Query refetching.** QueryClient refetches on mount by default. If the server takes 30 seconds to generate a blueprint, navigating away and back triggers a new generation. Tuned stale time, added retry guards, auth-aware error handling.

## What's next

- Better AI prompts (blueprint quality varies by industry)
- Multi-user workspaces
- Real competitor monitoring (weekly automated briefs)
- Stripe/GitHub/Linear integrations
- Template system for different startup types

---

Built by a student with too much free time. Ship fast. Stay technical. Don't use purple.
