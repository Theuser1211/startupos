---
noteId: "0ab5ebe06c6411f19a1d27ff79f85615"
tags: []

---

# Blueprint Generation Failure Analysis

## Issue
`POST /blueprints/generate` returns 500 InternalServerError in production.

## Root Cause Analysis

### Flow Trace
```
POST /blueprints/generate
  → generateBlueprintHandler (blueprint.handler.ts:8)
    → prisma.startup.findUnique() ✅
    → prisma.blueprint.findUnique() ✅
    → prisma.job.findFirst() ✅
    → prisma.job.create() ✅
    → getQueue().add() ⚠️ POTENTIAL FAILURE POINT
    → reply.status(202).send() ← 500 IF queue.add() THROWS
```

### Evidence from Code

**Handler (before fix):** No try/catch around `queue.add()` - any error bubbles to Fastify error handler → generic 500.

**Worker (before fix):** No error logging in processor - failures silent except `worker.on("failed")` which only logs `err.message`.

**Queue Setup (before fix):** No Redis connection event listeners - connection failures invisible.

### Test Results (Local Verification)

```
=== Testing Blueprint Generation Flow ===
1. Database connection...      ✅
2. Queue connection...         ✅
3. AI provider init...         ✅ (FreeLLMAPI active)
4. AI provider call...         ⚠️ FreeLLM failed (statusCode: 0)
                               ✅ Groq fallback SUCCEEDED
```

**Key Finding:** FreeLLM API key appears invalid/expired (network error, statusCode 0). Groq fallback works correctly.

## Fixes Applied

| File | Change | Purpose |
|------|--------|---------|
| `blueprint.handler.ts` | Wrapped handler in try/catch, added structured error logging | Expose actual error instead of generic 500 |
| `blueprint.handler.ts` | Added queue.add() error handling with job status update | Mark job FAILED if queue unreachable |
| `worker.ts` | Added try/catch in processor with detailed error logging | Capture worker failures with full context |
| `worker.ts` | Enhanced `worker.on("failed")` with stack trace | Permanent failure visibility |
| `setup.ts` | Added Redis connection event listeners (error, connect, ready) | Visibility into Redis connection state |
| `setup.ts` | Added Queue/QueueEvents/Worker error event listeners | Catch all queue-level errors |

## Production Failure Scenarios

| Scenario | Before Fix | After Fix |
|----------|------------|-----------|
| FreeLLM key invalid | 500 (no visibility) | Falls back to Groq ✅ |
| Redis down during queue.add | 500, job stuck PENDING | Job marked FAILED, error logged ✅ |
| Worker crashes processing | Silent, job stuck PROCESSING | Full error logged, job marked FAILED ✅ |
| Redis connection drops | Silent | Connection events logged ✅ |

## Verification

- ✅ TypeScript typecheck passes
- ✅ Build passes
- ✅ All 30 tests pass
- ✅ Local integration test confirms fallback chain test: FreeLLM→Groq works

## Deployment Checklist

- [ ] Verify `GROQ_API_KEY` is set in Railway Variables
- [ ] Verify `FREELLM_API_KEY` is valid or remove if unused
- [ ] Monitor Railway logs for `Blueprint generation handler failed` after deploy
- [ ] Verify job appears in `/jobs/:id` with status progression: PENDING → PROCESSING → COMPLETED/FAILED