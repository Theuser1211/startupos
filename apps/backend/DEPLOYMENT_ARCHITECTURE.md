# StartupOS — Deployment Architecture

> Date: 2026-06-19
> Status: Implementation complete

---

## Overview

Converts `Website.content` (AI-generated HTML) into real public URLs via hosting platform integration.

```
Website.content = { pages: [...], css: "...", js: "..." }
        ↓
buildDeployFiles()
        ↓
[{ path: "index.html", content: "..." }, ...]
        ↓
VercelProvider.deploy()
        ↓
https://startupos-ai-lawyer.vercel.app
        ↓
verifyDeployment() → HTTP 200 + content check
        ↓
Deployment.url stored in DB
```

---

## Components

### 1. File Builder (`src/services/deploy/builder.ts`)

Converts `WebsiteResult` into deployment files:

| Input | Output File |
|-------|-------------|
| `pages[0]` (slug `/`) | `index.html` |
| `pages[1]` (slug `/about`) | `about/index.html` |
| `pages[2]` (slug `/features`) | `features/index.html` |
| `css` | `styles.css` |
| `js` | `app.js` |

### 2. DeploymentProvider Interface (`src/services/deploy/types.ts`)

```typescript
interface DeploymentProvider {
  name: string;
  deploy(files: DeploymentFile[], siteName: string): Promise<DeploymentResult>;
  verify(url: string): Promise<VerificationResult>;
}
```

### 3. Vercel Provider (`src/services/deploy/vercel.ts`)

- Uses Vercel REST API (`/v13/deployments`)
- File contents base64-encoded
- Returns real `https://*.vercel.app` URL
- Requires `VERCEL_TOKEN` env var

### 4. Verification (`src/services/deploy/verify.ts`)

- HTTP GET to deployed URL
- Checks: status 200, content > 100 bytes, contains `<html>`
- Retries 3 times with 5s delay for propagation

---

## Environment Variables

```env
VERCEL_TOKEN=your-vercel-token    # Optional — falls back to mock URL
```

---

## Deployment States

```
PENDING → BUILDING → DEPLOYING → LIVE
                         ↓
                       FAILED
```

| State | Meaning |
|-------|---------|
| `PENDING` | Job created, waiting to start |
| `BUILDING` | Files being prepared |
| `DEPLOYING` | Uploaded to Vercel, waiting for propagation |
| `LIVE` | Deployed and verified |
| `FAILED` | Deployment or verification failed |

---

## Worker Flow

1. Read `Website.content` from DB
2. Call `buildDeployFiles()` → array of `{ path, content }`
3. If `VERCEL_TOKEN` set:
   - `VercelProvider.deploy()` → real URL
   - `verifyDeployment()` → HTTP 200 check
   - Store URL + provider in Deployment record
4. If no token:
   - Use mock URL `https://{websiteId}.startupos.app`
   - Log warning

---

## Files

| File | Purpose |
|------|---------|
| `src/services/deploy/types.ts` | Interfaces |
| `src/services/deploy/builder.ts` | Website.content → files |
| `src/services/deploy/vercel.ts` | Vercel REST API integration |
| `src/services/deploy/verify.ts` | Post-deploy verification |
| `src/queue/worker.ts` | Updated deployment handler |
| `prisma/schema.prisma` | Added `provider` field to Deployment |

---

## Adding New Providers

To add Netlify, Cloudflare Pages, etc.:

1. Create `src/services/deploy/netlify.ts` implementing `DeploymentProvider`
2. Add env var (`NETLIFY_AUTH_TOKEN`)
3. Update `handleDeployment` to select provider based on config

---

## Test Results

| Test | Result |
|------|--------|
| File builder — converts pages to files | ✅ |
| File builder — handles root page | ✅ |
| File builder — handles nested slugs | ✅ |
| File builder — skips empty css/js | ✅ |
| File builder — generates manifest | ✅ |
| Vercel — name property | ✅ |
| Vercel — throws without token | ✅ |
| Vercel — verify unreachable URL | ✅ |
| **Total** | **8/8 PASS** |
