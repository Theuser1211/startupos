---
noteId: "789528d0632f11f1938e5d9f7302402a"
tags: []

---

# AI Infrastructure Audit — StartupOS

## 1. Provider Overview

| Provider | Model | Cost | Status | Feature |
|----------|-------|------|--------|---------|
| **Google Gemini** | `gemini-2.5-flash` | PAID · $0.15/1M in · $0.60/1M out | ❌ DEAD CODE — never called | Blueprint generation |
| **OpenRouter** | `google/gemma-4-31b-it:free` | FREE | ✅ Active (priority 1) | Blueprint generation |
| **OpenRouter** | `qwen/qwen3-next-80b-a3b-instruct:free` | FREE | ✅ Active (priority 2) | Blueprint generation |
| **OpenRouter** | `moonshotai/kimi-k2.6:free` | FREE | ✅ Active (priority 3) | Blueprint generation |
| **OpenRouter** | `openrouter/free` | FREE | ✅ Active (last resort) | Blueprint generation |
| **Deterministic Engine** | Algorithmic | FREE | ✅ Active (final fallback) | Blueprint generation |

## 2. File-by-File Audit

### `/lib/ai/gemini.ts` — ❌ DEAD CODE
- **Model**: `gemini-2.5-flash` (PAID)
- **API Key**: `NEXT_PUBLIC_GOOGLE_API_KEY` (⚠️ Exposed client-side!)
- **Called by**: Nothing. The orchestrator (`orchestrator.ts`) only calls `generateOpenRouterBlueprint()`
- **Has**: Inline retry (once after 3s delay) + deterministic fallback
- **Recommendation**: Remove or leave dormant until added to OpenRouter fallback chain

### `/lib/ai/openrouter.ts` — ✅ ACTIVE
- **Models**: 4-model free fallback chain
- **API Key**: `OPENROUTER_API_KEY` (server-side only ✅)
- **Called by**: Orchestrator on `mode: "ai"`
- **Has**: Zod validation, JSON cleaning, automatic model cycling
- **Strengths**: All models are free-tier, no cost to run
- **Recommendation**: Keep as-is, add more free fallback models

### `/lib/ai/engine/orchestrator.ts` — ✅ ACTIVE
- Routes to AI or deterministic based on config
- Default: `mode: "ai"` with `fallbackOnFailure: true`
- **Issue**: `aiTimeoutMs: 30000` — no timeout is actually enforced for OpenRouter calls

### `/lib/ai/engine/retry.ts` — ❌ UNUSED
- `withRetry()` function exported but never imported
- gemini.ts and openrouter.ts implement their own retry
- **Recommendation**: Integrate into orchestrator for unified retry behavior

### `/lib/ai/validation/schema.ts` — ✅ ACTIVE
- Zod schema for blueprint validation
- Shared by both Gemini and OpenRouter paths

### `/lib/ai/client.ts` — ❌ DEAD CODE (depends on dead gemini.ts)
- Creates GoogleGenAI client singleton
- Only used by the dead gemini.ts

### `scripts/test-gemini-blueprint.ts` — 🧪 TEST ONLY
- Standalone test copy of the Gemini generation logic
- Not used in production

## 3. Cost Analysis

**Current costs: $0.00/month**
- OpenRouter fallback uses only free models
- Deterministic engine is algorithmic with no API calls
- Gemini code is dead — not called

**If Gemini were active:**
- 1 blueprint generation ≈ ~4,000 input + ~6,000 output tokens
- Cost: ~$0.0042 per generation (input) + ~$0.0036 (output) = ~$0.0078
- At 100 generations/month: ~$0.78
- At 1,000 generations/month: ~$7.80
- This is negligible — Gemini 2.5 Flash is extremely cheap

## 4. Issues Found

### Critical
- **NEXT_PUBLIC_GOOGLE_API_KEY is client-exposed**: The key is prefixed `NEXT_PUBLIC_` which means it's sent to the browser. Should be a server-only env var if used.

### High
- **Dead code**: `lib/ai/gemini.ts`, `lib/ai/client.ts` are fully implemented but never called
- **Unused retry utility**: `lib/ai/engine/retry.ts` is exported but never imported
- **No request timeout**: Orchestrator sets `aiTimeoutMs: 30000` but never enforces it

### Medium
- **No usage tracking**: AI calls are not recorded in the `usage_tracking` table
- **No cost monitoring**: No way to see API spend per user
- **Gemini test script duplicates schema**: `scripts/test-gemini-blueprint.ts` copies Zod schemas instead of importing from shared module

## 5. Recommended Fallback Chain (Optimized)

```typescript
// Priority order — cheapest/most reliable first
const RECOMMENDED_CHAIN = [
  "google/gemma-4-31b-it:free",             // 1. Fast, free Gemma
  "qwen/qwen3-next-80b-a3b-instruct:free",   // 2. Large Qwen, free
  "deepseek/deepseek-chat:free",              // 3. DeepSeek V3 free tier
  "moonshotai/kimi-k2.6:free",                // 4. Kimi K2, free
  "openrouter/free",                          // 5. OpenRouter auto-route to best free
  // DETERMINISTIC FALLBACK                   // 6. Algorithmic engine (always works)
];
```

## 6. Changes Made

1. Added `deepseek/deepseek-chat:free` to the OpenRouter fallback chain (missed this popular free model)
2. Removed the dead Gemini import dependency chain from the orchestrator (cleanup)
3. Left `lib/ai/gemini.ts` and `lib/ai/client.ts` intact as dormant code — can be re-enabled when Gemini is added to the OpenRouter fallback chain as a paid-but-reliable option

## 7. Future Recommendations

1. **Integrate `retry.ts`** into orchestrator for unified timeouts and retry behavior
2. **Add usage tracking**: AI calls should write to `usage_tracking` table
3. **Graduate Gemini to active**: Add `gemini-2.5-flash` as a paid fallback (after all free models) for higher reliability
4. **Remove dead code**: Delete `lib/ai/gemini.ts` and `lib/ai/client.ts` if Gemini is not planned to be used
5. **Add streaming support**: Allow UI to show progressive blueprint generation
