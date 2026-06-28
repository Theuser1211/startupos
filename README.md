# StartupOS

I build things for founders. This is the one I wish I had when I started my first company.

StartupOS is an AI-powered operating system for founders. You walk through an interview about your startup idea, and it generates a complete blueprint — brand positioning, ICP, revenue model, roadmap, competitor analysis, the whole thing.

It looks like a terminal because I got tired of generic AI SaaS design.

## Why I Built This

I ran into the same problem over and over. I'd have a startup idea, talk to some people, feel excited, then hit a wall. There was no single place to organize all the pieces — the customer profile, the go-to-market strategy, the product roadmap, the competitive landscape. I'd have docs scattered across Notion, Google Sheets, and a million browser tabs.

I wanted something that felt like a command center. A place where a founder could sit down, walk through a structured interview, and walk out with a real plan — not just a pitch deck template.

I also wanted it to look like something I'd actually want to use. Not another purple SaaS with rounded corners and a hero animation. Something that felt like it belonged in a terminal.

## What It Does

You answer a few questions about your startup: what you're building, who it's for, how you'll charge, what problem you solve. The AI takes that input and generates a full blueprint.

The workspace gives you tabs for every dimension of your startup. Verdict. Brand. ICP. Revenue. Roadmap. Roast. Each one is generated from your interview data.

There's a dashboard that tracks your startup health score, shows you ASCII progress bars, gives you a fortune cookie, and predicts your probability of failure. Because running a startup is grim and you might as well have fun with it.

## Features

- **Founder Interview** — Multi-step onboarding that collects your idea, stage, industry, customer, pricing, and problem. Validates every step. Handles conditional fields so you're not filling out irrelevant stuff.
- **Blueprint Generation** — AI generates a complete startup blueprint with verdict, brand positioning, ICP, revenue model, roadmap, and roast. Takes about 15-30 seconds depending on provider load.
- **Workspace** — Tabbed interface with 8 sections: Overview, Verdict, Website, Brand, ICP, Revenue, Roadmap, Roast. Each tab pulls from the generated blueprint.
- **Dashboard (Mission Control)** — Health score with animated ring, ASCII progress bars for foundational/product/launch/engagement metrics, recent event log, prioritized action items.
- **Fortune Cookie** — Daily founder wisdom. 118 aphorisms. Updates daily.
- **Death Predictor** — Computes your startup's failure probability based on health metrics, industry risk, and activity. Shows risk factors and recommendations.
- **Panic Button** — For those moments. You know the ones.
- **Competitor Intelligence** — Track competitors with snapshot history and change detection.
- **Daily Brief** — Health score summary, wins, priorities, competitor updates.
- **Website Generation** — Generate and deploy a website from your blueprint data.
- **Terminal Aesthetic** — Green-on-dark design, JetBrains Mono everywhere, ASCII dividers, status dots, blinking cursor.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS v4, Framer Motion
- **Backend:** Fastify, Node.js
- **Database:** PostgreSQL with Drizzle ORM
- **AI:** Multiple provider support with automatic failover (Google Gemini, OpenAI-compatible)
- **Auth:** Supabase
- **Deployment:** Vercel (frontend), Railway (backend)
- **Testing:** Playwright (61 E2E tests)

## Architecture

The frontend is a Next.js app with Turbopack. All pages are static by default. Auth state is managed via React context with a custom Supabase SSR client. API calls go through a centralized client that handles 401 redirects, token expiry, and friendly error messages.

The backend is a Fastify server with a module-based structure. Blueprint generation flows through a provider registry that supports multiple AI providers with cooldown logic. If one provider fails, it falls through to the next. Every step of the pipeline logs to console with structured prefixes so I can debug generation failures without digging through mountains of logs.

The frontend uses TanStack Query for data fetching. Caching is aggressive. Refetch logic is conservative. I learned the hard way that refetching a blueprint mid-generation causes confusing states.

Here's roughly how blueprint generation works:

```
Interview → Create startup → Generate prompt → Provider registry → 
AI call (with failover) → Validate response → Parse JSON → 
Persist to DB → Return to frontend
```

## Screenshots

<!-- TODO: Add screenshots of the landing page, interview flow, workspace, and dashboard -->

## Running Locally

```bash
git clone https://github.com/yourusername/startupos.git
cd startupos

# Frontend
cd apps/frontend
npm install
npm run dev

# Backend
cd apps/backend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` by default. The backend runs on `http://localhost:3001`.

## Environment Variables

**Frontend** (`apps/frontend/.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend** (`apps/backend/.env`):

```
DATABASE_URL=your_postgres_connection_string
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_URL=your_supabase_url
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
CORS_ORIGIN=http://localhost:3000
```

You'll need a Supabase project and at least one AI provider key. I run both Gemini and OpenAI and let the failover system handle the rest.

## Biggest Challenges

**Blueprint reliability was the hardest thing to get right.** AI providers timeout. They return malformed JSON. They hallucinate fields. I built a multi-provider failover system with cooldown logic, but even that wasn't enough. I had to add Zod validation on every response, a JSON extraction layer that handles common malformations, and front-end retry logic that reuses the same startup ID instead of creating duplicates.

**Hydration bugs drove me insane.** Next.js + browser extensions + localStorage interactions = random crashes. The footer was rendering the current year server-side and then React would flip out when the client-side year didn't match. I learned to use `suppressHydrationWarning` and defer dynamic values to client effects.

**The sidebar race condition was subtle.** `useSearchParams().get("id")` returns null on the first render after `router.push()`. This meant the workspace would flash an empty state before getting the URL parameter. I fixed it with a `paramsReady` guard, fallback to `window.location.search`, and localStorage persistence.

**Onboarding dead-ends.** If a user selected "one-time" as their business model, a conditional field for price range would hide. But the validation still checked it. I had to add `showIf` awareness to the validation function so hidden fields don't block form submission.

**Making the app survive refreshes.** TanStack Query refetches on mount by default. If the server takes 30 seconds to generate a blueprint, refetching every time the user navigates away and back is a terrible experience. I had to tune the stale time, implement retry guards, and add auth-aware error handling that doesn't pop you out to the login screen mid-generation.

## Reliability & Testing

I wrote 61 Playwright tests covering every flow I could think of:

- Public pages load correctly (including after hard refresh)
- Authentication: sign up, login, logout, wrong password, duplicate email, password mismatch, session expiry, protected route access
- Founder interview: all steps, all dropdowns, conditional fields, validation on every step, refresh recovery, minimum and maximum inputs
- Blueprint generation: single generation, retry on failure, refresh after generation, 5 consecutive generations without duplicates
- Workspace: all 8 tabs render, rapid switching doesn't crash, refresh preserves state
- Dashboard: every widget loads, fortune cookie persists daily, death predictor computes correctly, panic button works
- Competitors and brief pages: CRUD operations, empty states, refresh recovery
- Mobile: 375px viewport has no horizontal scroll, all buttons are reachable
- Stress tests: rapid navigation, spam-clicking, double submission, refresh during API calls, browser back/forward
- Error handling: 401 responses show "Authentication required" instead of crashing, logged-out states redirect gracefully

All 61 tests pass. The build compiles with zero TypeScript errors.

## What I Learned

**Design matters more than I thought.** The first version of this app looked like every other AI SaaS — purple gradients, glass cards, rounded everything. I spent a lot of time redoing the entire UI to look like a terminal. It was worth it. The app feels more serious now. Founders respond to it differently.

**AI isn't reliable enough to trust blindly.** Every response needs validation. Every provider needs a fallback. Every timeout needs a retry strategy. Building a system that works even when the AI doesn't is harder than building the features themselves.

**Testing catches things you'd never find manually.** The Playwright suite found bugs I'd been living with for weeks — flickering states during navigation, validation gaps on hidden form fields, race conditions in URL parameter parsing. I should have written the tests earlier.

**Monospace fonts everywhere is surprisingly polarizing.** Some people love it. Some people hate it. I'm in the love camp.

## Future Ideas

- Multi-user workspaces with role-based access
- Automated competitive monitoring with weekly briefs
- Template system for different startup types (SaaS, marketplace, hardware, etc.)
- Integrations with Stripe, GitHub, and Linear for real-time health metrics
- Mobile app with push notifications for critical startup events
- Community features — share blueprints, get feedback from other founders
- Y Combinator application generator (pulls from existing blueprint data)

## Final Thoughts

I built this because I wanted a tool that treated founders like operators, not content creators. There are a million tools that help you make pitch decks and landing pages. There aren't many that help you think clearly about your business.

StartupOS is still early. It has rough edges. But it works. I use it. A few other founders use it. And every time someone generates a blueprint and says "this is actually useful," it makes the weeks of debugging AI provider failures worth it.

Ship fast. Stay technical. And don't use purple.

---

*Built by a founder who's tired of AI-generated SaaS templates.*
