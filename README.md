---
noteId: "d4cd6bc06cc711f19a1d27ff79f85615"
tags: []

---

# StartupOS Backend

Backend API for StartupOS — an AI-powered startup website generation platform. Users register, create startup profiles, generate AI-driven business blueprints, build full multi-page websites from those blueprints, and deploy them.

**Flow:** Register → Create Startup → Generate Blueprint (AI) → Generate Website (AI) → Deploy (Vercel)

---

## Tech Stack

| Runtime | Database | Queue | Auth |
|---------|----------|-------|------|
| Node.js 22, Fastify 5 | PostgreSQL 16 (Prisma ORM) | Redis 7 (BullMQ) | JWT (bcrypt) |

- **AI Providers:** Groq, FreeLLM, OpenRouter (with fallback chain)
- **Deployment:** Vercel API (or mock mode)
- **Logging:** Pino
- **Validation:** Zod, Fastify JSON Schema

---

## Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 16 (running)
- Redis 7 (running)

### Setup

```bash
# Install dependencies
npm ci

# Configure environment
cp .env.example .env
# Edit .env: DATABASE_URL, REDIS_HOST/PORT, JWT_SECRET, and at least one AI API key

# Generate Prisma client & push schema
npm run db:generate
npm run db:push

# Start development server (hot-reload)
npm run dev
```

Server starts at `http://localhost:3000`. Swagger docs at `/docs`.

### Docker

```bash
npm run docker:up
```

Starts PostgreSQL, Redis, and the app via Docker Compose.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `REDIS_URL` | No | — | Redis connection string (overrides HOST/PORT) |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `GROQ_API_KEY` | No* | — | Groq AI provider |
| `FREELLM_API_KEY` | No* | — | FreeLLM AI provider |
| `OPENROUTER_API_KEY` | No* | — | OpenRouter AI provider |
| `VERCEL_TOKEN` | No | — | Vercel API token (deployment) |
| `PORT` | No | `3000` | HTTP port |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiration |
| `AI_TIMEOUT_MS` | No | `60000` | AI request timeout |
| `JOB_TIMEOUT_MS` | No | `600000` | Job processing timeout (10 min) |
| `LOG_LEVEL` | No | `info` | Pino log level |

\* At least one AI API key is required for generation features.

---

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check (DB + Redis status) |
| GET | `/docs` | Swagger UI |
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login |

### Protected (Bearer Token)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/me` | Current user profile |
| POST | `/startups` | Create startup |
| GET | `/startups` | List user's startups |
| GET | `/startups/:id` | Get startup (includes blueprint, websites) |
| DELETE | `/startups/:id` | Delete startup |
| POST | `/blueprints/generate` | Queue AI blueprint generation |
| GET | `/blueprints/:id` | Get blueprint |
| POST | `/websites/generate` | Queue AI website generation |
| GET | `/websites/:id` | Get website (includes spec, deployment) |
| POST | `/deployments/create` | Queue deployment |
| GET | `/deployments/:id` | Get deployment |
| GET | `/jobs/:id` | Get async job status/result |

---

## Architecture

```
src/
├── server.ts              # Fastify bootstrap, health check, shutdown
├── modules/
│   ├── auth/              # Register, login, profile
│   ├── startups/          # Startup CRUD
│   ├── blueprints/        # AI blueprint generation
│   ├── websites/          # AI website generation
│   ├── deployments/       # Vercel deployment
│   └── jobs/              # Async job polling
├── services/
│   ├── ai/                # AI provider abstraction (Groq, FreeLLM, OpenRouter)
│   ├── renderer/          # Website page rendering (HTML)
│   └── deploy/            # Build & deploy pipeline
├── queue/
│   ├── setup.ts           # BullMQ queue
│   ├── worker.ts          # Job processors
│   └── monitor.ts         # Job timeout monitor
├── middleware/auth.ts      # JWT verification
├── lib/                   # Shared utilities (env, errors, jwt, logger)
├── db/client.ts           # Prisma singleton
└── types/                 # TypeScript type definitions

prisma/
└── schema.prisma          # Database models
```

### Data Model

- **User** → has many **Startups**
- **Startup** → has one **Blueprint**, many **Websites**, many **Jobs**
- **Website** → has one **WebsiteSpec**, one **Deployment**
- **Job** → tracks async operations (blueprint gen, website gen, deployment)

### Async Jobs

Long-running tasks are processed via BullMQ:

1. **Blueprint Generation** — AI generates a structured business blueprint
2. **Website Generation** — AI generates a website spec, then renders each page as HTML
3. **Deployment** — Builds HTML files and deploys to Vercel

Jobs run with up to 3 retries and a 10-minute timeout. Poll `GET /jobs/:id` for status.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot-reload |
| `npm run build` | Production bundle (esbuild) |
| `npm start` | Start production server |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm test` | Run tests (Vitest) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |

---

## Authentication

JWT-based. Register at `/auth/register` to get a token, then include it in requests:

```
Authorization: Bearer <token>
```

All resource endpoints enforce ownership — users can only access their own startups, blueprints, websites, and deployments.
