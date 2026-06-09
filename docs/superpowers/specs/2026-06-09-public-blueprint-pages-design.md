# Public Blueprint Pages — Design Spec

**Date:** 2026-06-09
**Author:** Lead Growth Engineer
**Status:** Approved (Updated)

## Goal

A founder can share a StartupOS blueprint with anyone via a public URL. The public page is read-only, SEO-optimized, and configurable per blueprint. Public pages create a growth loop through StartupOS attribution.

## Requirements

- Route: `/s/[token]`
- Page shows: Startup Name, Tagline, Verdict, Roadmap, Roast Summary (configurable)
- SEO: Dynamic metadata, OpenGraph tags, Twitter tags, Canonical URL
- Sharing: Copy Link button, Share button (Twitter, LinkedIn, Email), Public URL
- Security: Public pages read-only, private data never exposed
- Performance: Server-side rendered, fast initial load
- Growth: "Published with StartupOS" attribution badge
- Analytics: Track public page views
- No workspace redesign

## Architecture

### 1. Database Schema Changes

Add four columns to `blueprints` table via new migration:

```sql
ALTER TABLE blueprints
  ADD COLUMN visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  ADD COLUMN share_token TEXT UNIQUE NULL,
  ADD COLUMN public_sections JSONB DEFAULT '["tagline","verdict","roadmap","roast"]',
  ADD COLUMN public_views INTEGER DEFAULT 0;

CREATE UNIQUE INDEX idx_blueprints_share_token ON blueprints(share_token) WHERE share_token IS NOT NULL;

-- Public read policy for published blueprints
CREATE POLICY "Public read for published blueprints"
  ON blueprints FOR SELECT
  USING (visibility = 'public');
```

**Column semantics:**

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `visibility` | TEXT | 'private' | Visibility state: 'private', 'public', (future: 'unlisted') |
| `share_token` | TEXT | NULL | 24-char hex token, generated only on Publish |
| `public_sections` | JSONB | 4 section names | Configurable visibility |
| `public_views` | INTEGER | 0 | View counter for public pages |

**Share token lifecycle:**

```
Draft (visibility='private', share_token=NULL)
  → Publish
  → Generate token
  → Public URL available (visibility='public', share_token='abc123...')
```

**Default public sections (4):**

- tagline
- verdict
- roadmap
- roast

**Private by default (must be manually enabled):**

- icp
- revenue
- competitors
- internal insights

### 2. Public API Route

**File:** `app/api/public-blueprints/[token]/route.ts`

```
GET /api/public-blueprints/[token]
```

- No auth required
- Queries `blueprints` where `share_token = token AND visibility = 'public'`
- Returns filtered blueprint data based on `public_sections` config
- Increments `public_views` counter on each request
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
  competitors?: Competitor[], // if in public_sections
  publicViews: number,     // view count
  shareUrl: string,        // canonical URL
}
```

### 3. Public Page Route

**File:** `app/s/[token]/page.tsx`

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
      url: `https://startupos.app/s/${params.token}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: blueprint.startupName,
      description: blueprint.tagline,
    },
    alternates: {
      canonical: `https://startupos.app/s/${params.token}`,
    },
  };
}
```

**Page layout (read-only):**

1. Hero section: Startup name + tagline + "Published with StartupOS" badge
2. Verdict card: Badge, score, summary
3. Roadmap section: Phases with status indicators
4. Roast section: Score, verdict, items with severity
5. ICP section (if enabled): Pain points, goals, recommendations
6. Revenue section (if enabled): Model, pricing, projections chart
7. Competitors section (if enabled): Strengths, weaknesses, opportunities
8. Share bar: Copy Link + Share menu (Twitter, LinkedIn, Email) + view count

**Security:**

- Server component (no client state)
- Fetches from Supabase server client (uses RLS public policy)
- Never renders `interview_data`, `user_id`, or private sections

### 4. Share Menu Component

**File:** `components/startup/share-menu.tsx`

Multi-platform share dropdown:

- **Copy Link**: Copies `https://startupos.app/s/{token}` to clipboard with toast confirmation
- **Share on Twitter/X**: Opens `https://twitter.com/intent/tweet?text=...&url=...`
- **Share on LinkedIn**: Opens `https://www.linkedin.com/sharing/share-offsite/?url=...`
- **Share via Email**: Opens `mailto:?subject=...&body=...`

Uses native Web Share API on mobile (if available) as primary action.

### 5. Publish Action in Workspace Sidebar

**Modified file:** `components/workspace/sidebar.tsx`

- Add "Publish" toggle/button below blueprint name
- Shows current status: "Draft" or "Published"
- On publish: calls `POST /api/blueprints/publish` which sets `visibility = 'public'` and generates `share_token`
- Shows share URL with copy button after publishing
- Confirmation dialog before unpublishing

**New API route:** `POST /api/blueprints/publish`

- Requires auth (must own the blueprint)
- On publish: sets `visibility = 'public'`, generates `share_token` if not exists
- On unpublish: sets `visibility = 'private'`, sets `share_token = NULL`
- Returns `share_token`

### 6. StartupOS Growth Attribution

**Badge in hero section:**

```html
<a href="https://startupos.app" class="startupos-badge">
  Published with StartupOS
</a>
```

**Requirements:**

- Visible badge in hero section, links back to StartupOS homepage
- Styled as a subtle, non-intrusive badge
- Included in OpenGraph metadata when appropriate

### 7. Public Analytics Foundation

**Database field:**

```sql
public_views INTEGER DEFAULT 0
```

**Implementation:**

- Increment `public_views` on each public page view (in API route)
- Display view count on public page (e.g., "123 views")
- Prepare for future analytics expansion (shares, clicks)

**Future metrics (not implemented yet):**

- shares
- clicks
- referral sources

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/00003_public_blueprints.sql` | Create | Schema migration |
| `app/api/public-blueprints/[token]/route.ts` | Create | Public API endpoint |
| `app/api/blueprints/publish/route.ts` | Create | Publish/unpublish endpoint |
| `app/s/[token]/page.tsx` | Create | Public page (SSR) |
| `app/s/[token]/loading.tsx` | Create | Loading skeleton |
| `components/startup/share-menu.tsx` | Create | Share dropdown |
| `components/startup/startupos-badge.tsx` | Create | Attribution badge |
| `components/workspace/sidebar.tsx` | Modify | Add publish button |
| `lib/supabase/types.ts` | Modify | Add new columns to Database type |

## Security Model

- Public read only for `visibility = 'public'` blueprints
- Share token prevents UUID enumeration (cryptographically random 24-char hex)
- Configurable sections limit data exposure
- Never expose: `user_id`, `email`, `interview_data`, raw pricing internals
- Publish/unpublish requires auth + ownership
- Unpublished blueprints return 404 (no token = no public access)
- Private sections never leak through API (filtered before response)

## Verification Steps

1. Run migration: `npx supabase db push`
2. Test public API: `curl http://localhost:3000/api/public-blueprints/{token}`
3. Test page loads: visit `/s/{token}` in browser
4. Test SEO: validate metadata with `curl -I` or OpenGraph debugger
5. Test sharing: verify Copy Link, Twitter, LinkedIn, Email links
6. Test security: verify 404 for invalid tokens, verify private sections hidden
7. Test publish/unpublish flow from workspace sidebar
8. Test view counter increments on page views
9. Test StartupOS badge links to homepage
10. Run `npm run build` to verify no type errors
