# StartupOS

AI-powered startup website generation platform. Users register, create startup profiles, generate AI-driven business blueprints, build full multi-page websites from those blueprints, and deploy them.

## Repository structure

```
startupos/
├── apps/
│   ├── frontend/        Next.js 16 web application (Vercel)
│   └── backend/         Fastify 5 API server (Railway)
├── packages/
│   └── shared/          Shared TypeScript types (@startupos/shared)
├── package.json         npm workspaces root
└── README.md
```

## Prerequisites

- Node.js 22+
- npm 10+

## Getting started

```bash
# Install all dependencies (builds @startupos/shared automatically)
npm install

# Start both frontend and backend in development mode
npm run dev

# Or start individually
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:3001
```

## Environment variables

Each app has its own `.env.example`. Copy it to `.env.local`:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
```

See each app's README for the full list of required variables.

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend & backend in dev mode |
| `npm run dev:frontend` | Start Next.js dev server |
| `npm run dev:backend` | Start Fastify dev server |
| `npm run build` | Build shared types → backend → frontend |
| `npm run build:frontend` | Build frontend (Next.js with Webpack) |
| `npm run build:backend` | Build backend (esbuild) |
| `npm test` | Run all tests |
| `npm run lint` | Lint all apps |

## Apps

### Frontend (`apps/frontend`)

Next.js 16 app with Tailwind CSS v4, deployed on **Vercel**.

- [Frontend README](apps/frontend/README.md)

### Backend (`apps/backend`)

Fastify 5 API with PostgreSQL (Prisma) and Redis (BullMQ), deployed on **Railway**.

- [Backend README](apps/backend/README.md)

## Packages

### Shared (`packages/shared`)

TypeScript type definitions shared between frontend and backend (`@startupos/shared`).

Built automatically on `npm install` via the `prepare` script. TypeScript source in `src/` compiles to `dist/`.

## Deployment

### Vercel (frontend)

1. Connect `Theuser1211/startupos` to Vercel
2. Set **Root Directory** to `apps/frontend`
3. Configure environment variables in Vercel dashboard
4. Deploy

Build uses Webpack (`next build --webpack`). The `installCommand` runs `cd ../.. && npm install` to install from the monorepo root so workspace dependencies resolve correctly.

### Railway (backend)

Deploy `apps/backend` with PostgreSQL and Redis add-ons.
