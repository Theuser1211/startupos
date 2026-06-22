# Monorepo Migration Summary

## Target Structure

```
startupos/
├── apps/
│   ├── backend/      (Fastify backend - moved from startupos-backend/)
│   └── frontend/     (Next.js frontend - moved from startupos-v2/startupos-v2/)
├── packages/
│   └── shared/       (placeholder - shared types/utilities go here)
├── docs/             (root-level documentation)
├── package.json      (npm workspaces root)
├── .gitignore
└── package-lock.json (single source of truth)
```

## Files Moved

### Backend (`apps/backend/`)
All files from `startupos-backend/` moved via git subtree with full history:
- `src/` — TypeScript source code
- `prisma/` — Database schema and migrations
- `tests/` — Vitest test files
- `scripts/` — Utility scripts
- `docker/` — Docker configuration
- `Dockerfile`, `docker-compose.yml`, `docker-entrypoint.sh`
- `railway.toml`
- Configuration: `tsconfig.json`, `vitest.config.ts`, `package.json`
- `docs/` directory moved to root `docs/`

### Frontend (`apps/frontend/`)
All files from `startupos-v2/startupos-v2/` copied via git subtree with full history:
- `app/` — Next.js App Router pages
- `components/` — React components
- `lib/` — API client, hooks, types, utilities
- `public/` — Static assets
- `scripts/` — QA and utility scripts
- `supabase/` — Supabase migrations and templates
- `claude-code-proxy/` — Embedded sub-project
- Configuration: `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `package.json`

### Root
- `package.json` — npm workspaces configuration
- `.gitignore` — Global ignore patterns
- `docs/` — Consolidated documentation

## Files Changed

### `startupos/package.json` (NEW)
Root package.json with npm workspaces:
```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:backend": "npm run dev -w apps/backend",
    "dev:frontend": "npm run dev -w apps/frontend",
    "dev": "concurrently -n backend,frontend -c blue,green \"npm run dev:backend\" \"npm run dev:frontend\"",
    "build": "npm run build -w apps/backend && npm run build -w apps/frontend",
    "build:backend": "npm run build -w apps/backend",
    "build:frontend": "npm run build -w apps/frontend",
    "test": "npm run test -w apps/backend && npm run test -w apps/frontend",
    "test:backend": "npm run test -w apps/backend",
    "test:frontend": "npm run test -w apps/frontend",
    "lint": "npm run lint -w apps/backend ; npm run lint -w apps/frontend",
    "typecheck": "npm run typecheck -w apps/backend"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}
```

### `startupos/.gitignore` (NEW)
```
node_modules/
dist/
.next/
.env
.env.*
*.log
.DS_Store
coverage/
*.tsbuildinfo
```

### `startupos/apps/backend/package.json`
- `"ioredis": "^5.10.1"` → `"ioredis": "5.10.1"` (pinned to match BullMQ's bundled version, prevents workspace hoisting type mismatch)

### `startupos/apps/backend/.env`
- `PORT=3000` → `PORT=3001` (avoids port conflict with frontend on port 3000)

### `startupos/apps/frontend/tsconfig.json`
- Added `"frontend"` to `exclude` array (prevents the dormant `frontend/` archive subfolder from being compiled)

## New Commands (run from repo root)

| Command | Description |
|---------|-------------|
| `npm run dev:backend` | Start backend dev server on port 3001 |
| `npm run dev:frontend` | Start frontend dev server on port 3000 |
| `npm run dev` | Start both concurrently |
| `npm run build` | Build both apps |
| `npm run build:backend` | Build backend only |
| `npm run build:frontend` | Build frontend only |
| `npm run test` | Run all tests |
| `npm run test:backend` | Run backend tests |
| `npm run test:frontend` | Run frontend tests |
| `npm run lint` | Lint both apps |
| `npm run typecheck` | TypeScript check backend |

## Git History Preserved

Both repositories' commit histories were merged using `git subtree`:
- Backend: 23 commits from `startupos-backend` (first commit: `df18f2d`)
- Frontend: 33 commits from `startupos-v2/startupos-v2` (first commit: `ae50b31`)

## Pre-existing Test Failures (not caused by migration)

- `apps/backend/tests/website-generation.test.ts` — 1 test fails: "escapes HTML in user content". The fallback template includes a legitimate `<script>` tag for navigation toggle, causing the assertion `expect(result.html).not.toContain("<script>")` to fail.
- `apps/frontend/__tests__/deploy.test.ts` — 6 tests fail: imports `@/lib/startup/deploy` which does not exist. Stale test.
- `apps/frontend/__tests__/e2e-flow.test.ts` — 68 tests skipped: requires running dev server.

## Verification Checklist

- [x] `npm install` from root: 832 packages, 5 infosec vulnerabilities (same as standalone)
- [x] `npm run dev:backend`: server starts, Redis connects, DB connects, listens on port 3001
- [x] `npm run dev:frontend`: Next.js dev server starts in 1.4s, listens on port 3000
- [x] `npm run dev` (both concurrently): no port conflict, both start successfully
- [x] `npm run build -w apps/backend`: esbuild produces dist/server.js (134.5kb)
- [x] `npm run build -w apps/frontend`: Next.js compiles, TypeScript passes, 7 routes generated
- [x] Backend typecheck: passes
- [x] Backend tests: 51/52 pass, 1 pre-existing failure
- [x] `.env` files preserved: backend `.env` + `.env.deploy`, frontend `.env.local`
- [x] Docker files preserved: Dockerfile, docker-compose.yml, railway.toml

## Future Steps

1. Create `packages/shared/` with shared TypeScript types (API client types, Zod schemas)
2. Remove the dormant `apps/frontend/frontend/` archive subfolder
3. Remove stale `apps/frontend/__tests__/deploy.test.ts` (references nonexistent module)
4. Fix the XSS test in `apps/backend/tests/website-generation.test.ts`
5. Set up CI/CD for the monorepo
6. Consider Turbopack root config to suppress Next.js workspace warning
