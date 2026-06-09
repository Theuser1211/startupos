# Public Blueprint Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create public blueprint pages at `/s/[token]` with SEO, sharing, analytics, and StartupOS attribution.

**Architecture:** Add visibility/share_token columns to blueprints table, create public API endpoint, SSR page with dynamic metadata, share menu, publish toggle in workspace sidebar.

**Tech Stack:** Next.js 14 App Router, Supabase, Tailwind CSS, Lucide React, Framer Motion

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/00005_public_blueprints.sql` | Create | Add visibility, share_token, public_sections, public_views columns |
| `lib/supabase/types.ts` | Modify | Add new columns to Database type |
| `app/api/public-blueprints/[token]/route.ts` | Create | Public API endpoint (no auth) |
| `app/api/blueprints/publish/route.ts` | Create | Publish/unpublish endpoint (auth required) |
| `app/s/[token]/page.tsx` | Create | Public page (SSR with generateMetadata) |
| `app/s/[token]/loading.tsx` | Create | Loading skeleton |
| `components/startup/share-menu.tsx` | Create | Share dropdown component |
| `components/startup/startupos-badge.tsx` | Create | Attribution badge component |
| `components/workspace/sidebar.tsx` | Modify | Add publish button |

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/00005_public_blueprints.sql`

- [ ] **Step 1: Create migration file**

```sql
-- Migration: Add public blueprint support
-- Run after 00004_custom_domains.sql

-- Add new columns to blueprints table
ALTER TABLE blueprints
  ADD COLUMN visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  ADD COLUMN share_token TEXT UNIQUE NULL,
  ADD COLUMN public_sections JSONB DEFAULT '["tagline","verdict","roadmap","roast"]',
  ADD COLUMN public_views INTEGER DEFAULT 0;

-- Partial index for share_token (only non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_blueprints_share_token 
  ON blueprints(share_token) 
  WHERE share_token IS NOT NULL;

-- Public read policy for published blueprints
CREATE POLICY "Public read for published blueprints"
  ON blueprints FOR SELECT
  USING (visibility = 'public');
```

- [ ] **Step 2: Verify migration syntax**

Run: `npx supabase db diff` (or manually verify SQL syntax)
Expected: No syntax errors

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/00005_public_blueprints.sql
git commit -m "feat: add public blueprint support migration"
```

---

### Task 2: Update Database Types

**Files:**
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1: Add new columns to blueprints Row type**

Find the `blueprints` table type definition and add these columns to the `Row` type:

```typescript
visibility: "private" | "public";
share_token: string | null;
public_sections: string[];
public_views: number;
```

- [ ] **Step 2: Add new columns to blueprints Insert type**

Add to the `Insert` type:

```typescript
visibility?: "private" | "public";
share_token?: string | null;
public_sections?: string[];
public_views?: number;
```

- [ ] **Step 3: Add new columns to blueprints Update type**

Add to the `Update` type:

```typescript
visibility?: "private" | "public";
share_token?: string | null;
public_sections?: string[];
public_views?: number;
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new type errors (pre-existing errors in scripts/ are acceptable)

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "feat: add public blueprint columns to Database type"
```

---

### Task 3: Public API Endpoint

**Files:**
- Create: `app/api/public-blueprints/[token]/route.ts`

- [ ] **Step 1: Create the public API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { StartupBlueprint } from "@/lib/startup/blueprint";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  if (!token || token.length !== 24) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const supabase = await createClient();

  // Query for published blueprint with matching token
  const { data, error } = await supabase
    .from("blueprints")
    .select("blueprint, public_sections, public_views, name, idea, industry, stage")
    .eq("share_token", token)
    .eq("visibility", "public")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  // Increment view counter (fire and forget)
  supabase
    .from("blueprints")
    .update({ public_views: (data.public_views || 0) + 1 })
    .eq("share_token", token)
    .then(() => {});

  // Cast blueprint to proper type
  const blueprint = data.blueprint as unknown as StartupBlueprint;

  // Filter sections based on public_sections config
  const publicSections = (data.public_sections as string[]) || [];
  const response: Record<string, unknown> = {
    startupName: blueprint.startupName,
    tagline: blueprint.tagline,
    verdict: blueprint.verdict,
    publicViews: (data.public_views || 0) + 1,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://startupos.app"}/s/${token}`,
  };

  // Conditionally include sections
  if (publicSections.includes("icp")) {
    response.icp = blueprint.icp;
  }
  if (publicSections.includes("revenue")) {
    response.revenue = blueprint.revenue;
  }
  if (publicSections.includes("roadmap")) {
    response.roadmap = blueprint.roadmap;
  }
  if (publicSections.includes("roast")) {
    response.roast = blueprint.roast;
  }
  if (publicSections.includes("competitors")) {
    response.competitors = blueprint.competitors;
  }

  return NextResponse.json(response);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new type errors

- [ ] **Step 3: Commit**

```bash
git add app/api/public-blueprints/[token]/route.ts
git commit -m "feat: add public blueprint API endpoint"
```

---

### Task 4: Publish/Unpublish API Endpoint

**Files:**
- Create: `app/api/blueprints/publish/route.ts`

- [ ] **Step 1: Create the publish API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

function generateShareToken(): string {
  return crypto.randomBytes(12).toString("hex");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { id, action } = body;

  if (!id || !action) {
    return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
  }

  if (action !== "publish" && action !== "unpublish") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Verify ownership
  const { data: blueprint, error: fetchError } = await supabase
    .from("blueprints")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  if (blueprint.user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Build updates based on action
  const updates: Record<string, unknown> = {};

  if (action === "publish") {
    updates.visibility = "public";
    updates.share_token = generateShareToken();
  } else {
    updates.visibility = "private";
    updates.share_token = null;
  }

  // Apply updates
  const { data: updated, error: updateError } = await supabase
    .from("blueprints")
    .update(updates)
    .eq("id", id)
    .select("share_token, visibility")
    .single();

  if (updateError) {
    console.error("[Publish API] Update error:", updateError.message);
    return NextResponse.json({ error: "Failed to update blueprint" }, { status: 500 });
  }

  return NextResponse.json({
    share_token: updated.share_token,
    visibility: updated.visibility,
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new type errors

- [ ] **Step 3: Commit**

```bash
git add app/api/blueprints/publish/route.ts
git commit -m "feat: add publish/unpublish API endpoint"
```

---

### Task 5: StartupOS Badge Component

**Files:**
- Create: `components/startup/startupos-badge.tsx`

- [ ] **Step 1: Create the badge component**

```tsx
import Link from "next/link";

export function StartupOSBadge() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white/60 hover:text-white/80 transition-colors rounded-full border border-white/10 hover:border-white/20"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-3 h-3"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      Published with StartupOS
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/startup/startupos-badge.tsx
git commit -m "feat: add StartupOS attribution badge"
```

---

### Task 6: Share Menu Component

**Files:**
- Create: `components/startup/share-menu.tsx`

- [ ] **Step 1: Create the share menu component**

```tsx
"use client";

import { useState } from "react";
import { Share2, Copy, Twitter, Linkedin, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareMenuProps {
  shareUrl: string;
  startupName: string;
  tagline: string;
  className?: string;
}

export function ShareMenu({ shareUrl, startupName, tagline, className }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${startupName} — StartupOS Blueprint`,
          text: tagline,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${startupName} — ${tagline}`)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`${startupName} — StartupOS Blueprint`)}&body=${encodeURIComponent(`Check out this startup blueprint:\n\n${shareUrl}`)}`;

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Twitter className="w-4 h-4" />
              Twitter / X
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href={emailUrl}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/startup/share-menu.tsx
git commit -m "feat: add share menu component"
```

---

### Task 7: Public Page (SSR)

**Files:**
- Create: `app/s/[token]/page.tsx`

- [ ] **Step 1: Create the public page with generateMetadata**

```tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StartupOSBadge } from "@/components/startup/startupos-badge";
import { ShareMenu } from "@/components/startup/share-menu";
import type { StartupBlueprint, Verdict, ICP, Revenue, Roadmap, Roast, Competitor } from "@/lib/startup/blueprint";

interface PublicBlueprintResponse {
  startupName: string;
  tagline: string;
  verdict: Verdict;
  icp?: ICP;
  revenue?: Revenue;
  roadmap?: Roadmap;
  roast?: Roast;
  competitors?: Competitor[];
  publicViews: number;
  shareUrl: string;
}

async function fetchPublicBlueprint(token: string): Promise<PublicBlueprintResponse | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blueprints")
    .select("blueprint, public_sections, public_views, name")
    .eq("share_token", token)
    .eq("visibility", "public")
    .single();

  if (error || !data) {
    return null;
  }

  const blueprint = data.blueprint as unknown as StartupBlueprint;
  const publicSections = (data.public_sections as string[]) || [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://startupos.app";

  const response: PublicBlueprintResponse = {
    startupName: blueprint.startupName,
    tagline: blueprint.tagline,
    verdict: blueprint.verdict,
    publicViews: data.public_views || 0,
    shareUrl: `${baseUrl}/s/${token}`,
  };

  if (publicSections.includes("icp")) response.icp = blueprint.icp;
  if (publicSections.includes("revenue")) response.revenue = blueprint.revenue;
  if (publicSections.includes("roadmap")) response.roadmap = blueprint.roadmap;
  if (publicSections.includes("roast")) response.roast = blueprint.roast;
  if (publicSections.includes("competitors")) response.competitors = blueprint.competitors;

  return response;
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const blueprint = await fetchPublicBlueprint(params.token);

  if (!blueprint) {
    return { title: "Blueprint Not Found" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://startupos.app";

  return {
    title: `${blueprint.startupName} — StartupOS Blueprint`,
    description: blueprint.tagline,
    openGraph: {
      title: blueprint.startupName,
      description: blueprint.tagline,
      type: "website",
      url: `${baseUrl}/s/${params.token}`,
    },
    twitter: {
      card: "summary_large_image",
      title: blueprint.startupName,
      description: blueprint.tagline,
    },
    alternates: {
      canonical: `${baseUrl}/s/${params.token}`,
    },
  };
}

function VerdictCard({ verdict }: { verdict: Verdict }) {
  const badgeColors: Record<string, string> = {
    pass: "bg-green-500/20 text-green-400 border-green-500/30",
    conditional: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "needs-work": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    fail: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Verdict</h2>
        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${badgeColors[verdict.badge] || badgeColors["needs-work"]}`}>
          {verdict.badgeLabel}
        </span>
      </div>
      <div className="text-3xl font-bold text-white mb-2">{verdict.compositeScore}/100</div>
      <p className="text-white/70">{verdict.summary}</p>
    </div>
  );
}

function RoadmapSection({ roadmap }: { roadmap: Roadmap }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <h2 className="text-lg font-semibold text-white mb-4">Roadmap</h2>
      <div className="space-y-6">
        {roadmap.map((phase, i) => (
          <div key={i}>
            <h3 className="text-sm font-medium text-white/60 mb-3">{phase.quarter}</h3>
            <div className="space-y-2">
              {phase.items.map((item, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    item.status === "done" ? "bg-green-400" :
                    item.status === "in-progress" ? "bg-yellow-400" : "bg-white/30"
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="text-xs text-white/50">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoastSection({ roast }: { roast: Roast }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Roast</h2>
        <span className="text-2xl font-bold text-white">{roast.score}/10</span>
      </div>
      <p className="text-white/70 mb-4">{roast.verdict}</p>
      <div className="space-y-2">
        {roast.items.slice(0, 5).map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={`px-2 py-0.5 text-xs rounded ${
              item.severity === "high" ? "bg-red-500/20 text-red-400" :
              item.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
              "bg-white/10 text-white/60"
            }`}>
              {item.rating}/10
            </span>
            <div>
              <div className="text-sm font-medium text-white">{item.category}</div>
              <div className="text-xs text-white/50">{item.feedback}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ICPSection({ icp }: { icp: ICP }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <h2 className="text-lg font-semibold text-white mb-4">Ideal Customer Profile</h2>
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-white/60">Title</div>
          <div className="text-white">{icp.title}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-white/60">Pain Points</div>
          <ul className="mt-1 space-y-1">
            {icp.painPoints.map((point, i) => (
              <li key={i} className="text-sm text-white/70">• {point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RevenueSection({ revenue }: { revenue: Revenue }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <h2 className="text-lg font-semibold text-white mb-4">Revenue Model</h2>
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-white/60">Model</div>
          <div className="text-white">{revenue.model}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-white/60">Pricing</div>
          <div className="text-white">{revenue.pricing}</div>
        </div>
      </div>
    </div>
  );
}

function CompetitorsSection({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <h2 className="text-lg font-semibold text-white mb-4">Competitors</h2>
      <div className="space-y-4">
        {competitors.map((comp, i) => (
          <div key={i} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
            <div className="font-medium text-white">{comp.name}</div>
            <div className="text-xs text-white/50 mt-1">
              <span className="text-green-400">Strength:</span> {comp.strength}
            </div>
            <div className="text-xs text-white/50">
              <span className="text-red-400">Weakness:</span> {comp.weakness}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PublicBlueprintPage({ params }: { params: { token: string } }) {
  const blueprint = await fetchPublicBlueprint(params.token);

  if (!blueprint) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-8">
          <StartupOSBadge />
          <h1 className="text-4xl font-bold text-white mt-4">{blueprint.startupName}</h1>
          <p className="text-xl text-white/70 mt-2">{blueprint.tagline}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/50">
            <span>{blueprint.publicViews.toLocaleString()} views</span>
          </div>
        </div>

        {/* Verdict */}
        <div className="mb-6">
          <VerdictCard verdict={blueprint.verdict} />
        </div>

        {/* Roadmap */}
        {blueprint.roadmap && (
          <div className="mb-6">
            <RoadmapSection roadmap={blueprint.roadmap} />
          </div>
        )}

        {/* Roast */}
        {blueprint.roast && (
          <div className="mb-6">
            <RoastSection roast={blueprint.roast} />
          </div>
        )}

        {/* ICP (if enabled) */}
        {blueprint.icp && (
          <div className="mb-6">
            <ICPSection icp={blueprint.icp} />
          </div>
        )}

        {/* Revenue (if enabled) */}
        {blueprint.revenue && (
          <div className="mb-6">
            <RevenueSection revenue={blueprint.revenue} />
          </div>
        )}

        {/* Competitors (if enabled) */}
        {blueprint.competitors && (
          <div className="mb-6">
            <CompetitorsSection competitors={blueprint.competitors} />
          </div>
        )}

        {/* Share Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <ShareMenu
            shareUrl={blueprint.shareUrl}
            startupName={blueprint.startupName}
            tagline={blueprint.tagline}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new type errors

- [ ] **Step 3: Commit**

```bash
git add app/s/[token]/page.tsx
git commit -m "feat: add public blueprint page with SSR and SEO"
```

---

### Task 8: Loading Skeleton

**Files:**
- Create: `app/s/[token]/loading.tsx`

- [ ] **Step 1: Create the loading skeleton**

```tsx
export default function PublicBlueprintLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 rounded bg-white/5 animate-pulse" />
          <div className="h-10 w-64 mt-4 rounded bg-white/5 animate-pulse" />
          <div className="h-6 w-96 mt-2 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Verdict skeleton */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 mb-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-white/5 animate-pulse" />
            <div className="h-8 w-20 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="h-8 w-16 mt-4 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-full mt-2 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Roadmap skeleton */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 mb-6">
          <div className="h-6 w-24 rounded bg-white/5 animate-pulse" />
          <div className="space-y-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-48 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-64 mt-1 rounded bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roast skeleton */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="h-6 w-16 rounded bg-white/5 animate-pulse" />
            <div className="h-8 w-12 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="h-4 w-full mt-4 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-3/4 mt-2 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/s/[token]/loading.tsx
git commit -m "feat: add public blueprint page loading skeleton"
```

---

### Task 9: Publish Button in Workspace Sidebar

**Files:**
- Modify: `components/workspace/sidebar.tsx`

- [ ] **Step 1: Add publish state and handler to sidebar**

First, read the current sidebar file to understand the exact structure. Then add:

1. Import `useState` and `useEffect` from React
2. Import `Globe`, `Loader2` from lucide-react
3. Add props for `blueprintId`, `isPublished`, `shareToken`, and `onPublishToggle`
4. Add publish button in the bottom section

The publish button should:
- Show "Publish" when draft, "Published" when published
- Show a loading spinner when publishing
- Show the share URL with copy button when published

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new type errors

- [ ] **Step 3: Commit**

```bash
git add components/workspace/sidebar.tsx
git commit -m "feat: add publish button to workspace sidebar"
```

---

### Task 10: Update Workspace to Pass Publish Props

**Files:**
- Modify: `app/workspace/page.tsx`

- [ ] **Step 1: Add publish state management**

Add state for:
- `publishStatus`: `{ isPublished: boolean; shareToken: string | null }`
- `isPublishing`: boolean for loading state

Add handler:
- `handlePublishToggle`: Calls `POST /api/blueprints/publish` and updates state

Pass these props to the `Sidebar` component.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No new type errors

- [ ] **Step 3: Commit**

```bash
git add app/workspace/page.tsx
git commit -m "feat: integrate publish state in workspace"
```

---

### Task 11: Final Verification

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No new type errors

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Manual testing checklist**

1. Create a new blueprint via interview
2. Click "Publish" in sidebar
3. Verify share URL is generated
4. Open share URL in incognito window
5. Verify public page loads with correct sections
6. Verify SEO metadata (view source)
7. Test Copy Link button
8. Test Share on Twitter link
9. Test Share on LinkedIn link
10. Click "Published" to unpublish
11. Verify public URL returns 404
12. Verify view counter increments

- [ ] **Step 4: Commit final changes**

```bash
git add -A
git commit -m "feat: complete public blueprint pages feature"
```
