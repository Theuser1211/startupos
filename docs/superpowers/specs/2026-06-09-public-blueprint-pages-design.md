# Public Blueprint Pages — Design Spec

**Date:** 2026-06-09
**Author:** Lead Growth Engineer
**Status:** Approved

## Goal

A founder can share a StartupOS blueprint with anyone via a public URL. The public page is read-only, SEO-optimized, and configurable per blueprint.

## Requirements

- Route: `/startup/[token]`
- Page shows: Startup Name, Tagline, Verdict, ICP, Revenue Model, Roadmap, Roast Summary
- SEO: Dynamic metadata, OpenGraph tags, Twitter tags, Canonical URL
- Sharing: Copy Link button, Share button (Twitter, LinkedIn, Email), Public URL
- Security: Public pages read-only, private data never exposed
- Performance: Server-side rendered, fast initial load
- No workspace redesign

## Architecture

### 1. Database Schema Changes

Add three columns to `blueprints` table via new migration:

```sql
ALTER TABLE blueprints
  ADD COLUMN is_public BOOLEAN DEFAULT false,
  ADD COLUMN share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  ADD COLUMN public_sections JSONB DEFAULT '["tagline","verdict","icp","revenue","roadmap","roast"]';

CREATE UNIQUE INDEX idx_blueprints_share_token ON blueprints(share_token);

-- Public read policy for published blueprints
CREATE POLICY "Public read for published blueprints"
  ON blueprints FOR SELECT
  USING (is_public = true);
```

**Column semantics:**

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `is_public` | BOOLEAN | false | Explicit publish toggle |
| `share_token` | TEXT | random 24-char hex | Token for clean URLs |
| `public_sections` | JSONB | array of 6 section names | Configurable visibility |

### 2. Public API Route

**File:** `app/api/public-blueprints/[token]/route.ts`

```
GET /api/public-blueprints/[token]
```

- No auth required
- Queries `blueprints` where `share_token = token AND is_public = true`
- Returns filtered blueprint data based on `public_sections` config
- Never exposes: `user_id`, `interview_data`, internal metadata, private sections
- 404 if token invalid or blueprint not public

**Response shape:**

```typescript
{
  startupName: string,
  tagline: string,
  verdict: Verdict,        // always shown
  icp?: ICP,               // if in public_sections
  revenue?: Revenue,       // if in public_sections
  roadmap?: Roadmap,       // if in public_sections
  roast?: Roast,           // if in public_sections
  shareUrl: string,        // canonical URL
}
```

### 3. Public Page Route

**File:** `app/startup/[token]/page.tsx`

Server component with `generateMetadata` for SEO.

**Dynamic metadata:**

```typescript
export async function generateMetadata({ params }) {
  const blueprint = await fetchPublicBlueprint(params.token);
  return {
    title: `${blueprint.startupName} — StartupOS Blueprint`,
    description: blueprint.tagline,
    openGraph: {
      title: blueprint.startupName,
      description: blueprint.tagline,
      type: 'website',
      url: `https://startupos.app/startup/${params.token}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: blueprint.startupName,
      description: blueprint.tagline,
    },
    alternates: {
      canonical: `https://startupos.app/startup/${params.token}`,
    },
  };
}
```

**Page layout (read-only):**

1. Hero section: Startup name + tagline
2. Verdict card: Badge, score, summary
3. ICP section: Pain points, goals, recommendations
4. Revenue section: Model, pricing, projections chart
5. Roadmap section: Phases with status indicators
6. Roast section: Score, verdict, items with severity
7. Share bar: Copy Link + Share menu (Twitter, LinkedIn, Email)

**Security:**

- Server component (no client state)
- Fetches from Supabase server client (uses RLS public policy)
- Never renders `interview_data`, `user_id`, or private sections

### 4. Share Menu Component

**File:** `components/startup/share-menu.tsx`

Multi-platform share dropdown:

- **Copy Link**: Copies `https://startupos.app/startup/{token}` to clipboard with toast confirmation
- **Share on Twitter/X**: Opens `https://twitter.com/intent/tweet?text=...&url=...`
- **Share on LinkedIn**: Opens `https://www.linkedin.com/sharing/share-offsite/?url=...`
- **Share via Email**: Opens `mailto:?subject=...&body=...`

Uses native Web Share API on mobile (if available) as primary action.

### 5. Publish Action in Workspace Sidebar

**Modified file:** `components/workspace/sidebar.tsx`

- Add "Publish" toggle/button below blueprint name
- Shows current status: "Draft" or "Published"
- On publish: calls `POST /api/blueprints/publish` which sets `is_public = true` and generates `share_token`
- Shows share URL with copy button after publishing
- Confirmation dialog before unpublishing

**New API route:** `POST /api/blueprints/publish`

- Requires auth (must own the blueprint)
- Sets `is_public = true`, generates `share_token` if not exists
- Returns `share_token`

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/00003_public_blueprints.sql` | Create | Schema migration |
| `app/api/public-blueprints/[token]/route.ts` | Create | Public API endpoint |
| `app/api/blueprints/publish/route.ts` | Create | Publish/unpublish endpoint |
| `app/startup/[token]/page.tsx` | Create | Public page (SSR) |
| `app/startup/[token]/loading.tsx` | Create | Loading skeleton |
| `components/startup/share-menu.tsx` | Create | Share dropdown |
| `components/workspace/sidebar.tsx` | Modify | Add publish button |
| `lib/supabase/types.ts` | Modify | Add new columns to Database type |

## Security Model

- Public read only for `is_public = true` blueprints
- Share token prevents UUID enumeration
- Configurable sections limit data exposure
- Never expose: `user_id`, `email`, `interview_data`, raw pricing internals
- Publish/unpublish requires auth + ownership

## Verification Steps

1. Run migration: `npx supabase db push`
2. Test public API: `curl http://localhost:3000/api/public-blueprints/{token}`
3. Test page loads: visit `/startup/{token}` in browser
4. Test SEO: validate metadata with `curl -I` or OpenGraph debugger
5. Test sharing: verify Copy Link, Twitter, LinkedIn, Email links
6. Test security: verify 404 for invalid tokens, verify private sections hidden
7. Test publish/unpublish flow from workspace sidebar
8. Run `npm run build` to verify no type errors
