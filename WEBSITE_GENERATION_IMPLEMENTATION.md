# StartupOS — Website Generation Implementation Plan

> Audit date: 2026-06-19
> Purpose: Detailed implementation plan for AI website generation
> Status: Ready for immediate coding

---

## Overview

Transform the existing pipeline from:

```
Blueprint → WebsiteSpec (JSON) → Website.content = {}  (dead end)
```

To:

```
Blueprint → WebsiteSpec → AI generates HTML per page → Website.content = rendered HTML
```

---

## 1. Database Schema Changes

### Current schema (`prisma/schema.prisma:81-94`)

```prisma
model Website {
  id            String   @id @default(uuid())
  name          String
  content       Json
  status        String   @default("draft")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  startupId String
  startup   Startup    @relation(fields: [startupId], references: [id], onDelete: Cascade)
  spec  WebsiteSpec?
  deployment Deployment?
}
```

### Changes required

**No schema migration needed.** The existing fields are sufficient:

- `Website.content` (Json) — stores rendered HTML/CSS/JS. Currently `{}`, will be populated.
- `Website.status` (String) — lifecycle: `draft` → `spec_generated` → `rendered` → `deployed`

### Website.content format after rendering

```json
{
  "pages": [
    {
      "slug": "/",
      "title": "Home",
      "html": "<!DOCTYPE html><html lang=\"en\">...</html>"
    },
    {
      "slug": "/about",
      "title": "About",
      "html": "<!DOCTYPE html><html lang=\"en\">...</html>"
    }
  ],
  "css": ":root { --primary: #1a1a2e; } ...",
  "js": ""
}
```

This matches the existing `WebsiteResult` type in `src/types/ai.ts:52-67` (with `slug` and `title` replacing `name`).

### Website.status lifecycle

| Status | Meaning | Set by |
|--------|---------|--------|
| `draft` | Initial state | `createWebsiteHandler` (not used yet) |
| `spec_generated` | WebsiteSpec AI call completed | `handleWebsiteGeneration` (existing) |
| `rendered` | HTML generation completed | `handleWebsiteGeneration` (new step) |
| `deployed` | Deployed to hosting | `handleDeployment` (new step) |

---

## 2. Changes to AI Provider Interface

### File: `src/types/ai.ts`

Add new method to `AIProvider` interface and new output type:

```typescript
// Add to AIProvider interface (line 3-5)
export interface AIProvider {
  name: string;
  generateBlueprint(prompt: string): Promise<BlueprintResult>;
  generateWebsiteSpec(blueprint: BlueprintResult): Promise<WebsiteSpecResult>;
  generateWebsitePage(
    blueprint: BlueprintResult,
    spec: WebsiteSpecResult,
    page: PageSpec,
  ): Promise<PageHTMLResult>;  // NEW
}

// Add new type (after line 67)
export interface PageHTMLResult {
  slug: string;
  title: string;
  html: string;
}

// Update WebsiteResult to match output schema (replace lines 52-67)
export interface WebsiteResult {
  pages: PageHTMLResult[];
  css: string;
  js: string;
}
```

### File: `src/services/ai/provider.ts`

Add `generateWebsitePage` to `BaseAIProvider` abstract class:

```typescript
// Add to BaseAIProvider (after line 13)
abstract generateWebsitePage(
  blueprint: BlueprintResult,
  spec: WebsiteSpecResult,
  page: PageSpec,
): Promise<PageHTMLResult>;
```

Add `generateWebsitePageWithFallback` function (after `generateWebsiteSpecWithFallback`):

```typescript
export async function generateWebsitePageWithFallback(
  blueprint: BlueprintResult,
  spec: WebsiteSpecResult,
  page: PageSpec,
): Promise<PageHTMLResult> {
  // Same fallback chain pattern as generateBlueprintWithFallback
  // Tries FreeLLM → Groq → OpenRouter
  // Returns { slug, title, html }
}
```

Add page generation to each provider class (`FreeLLMProvider`, `GroqProvider`, `OpenRouterProvider`).

---

## 3. Prompt Design for Website Generation

### System prompt for page generation

Each provider gets the same prompt structure. The prompt takes the blueprint context, theme, and page spec, then outputs a complete HTML page.

**FreeLLM prompt (gpt-4o-mini):**

```
You are an expert web developer. Generate a complete, production-ready HTML page for a startup website.

Requirements:
- Output ONLY a single HTML file with all CSS inline in a <style> tag
- Use semantic HTML5 (header, nav, main, section, footer)
- Must be fully responsive (mobile-first)
- Use the theme colors provided
- Include the Inter font from Google Fonts
- All content must be real, compelling marketing copy — no placeholder text
- Include proper meta tags in <head>
- The page must be self-contained (no external CSS/JS except Google Fonts)
- Use CSS Grid or Flexbox for layout
- Include hover effects on interactive elements
- Include smooth scroll behavior

Theme:
- Primary color: {primaryColor}
- Secondary color: {secondaryColor}
- Font family: {fontFamily}
- Border radius: {borderRadius}

Startup context:
- Name: {startupName}
- Industry: {industry}
- Description: {description}
- Target audience: {targetAudience}
- Key features: {keyFeatures}
- Solution: {solution}

Page to generate:
- Name: {pageName}
- Slug: {pageSlug}
- Sections: {sections as JSON}

Return ONLY a JSON object with this exact structure:
{
  "html": "<!DOCTYPE html><html>...</html>"
}

The html field must contain the complete HTML document including <!DOCTYPE html>, <html>, <head>, and <body> tags.
Do NOT include ```json or ``` markers. Return raw JSON only.
```

**Groq prompt (llama-3.3-70b):** Same prompt, slightly shorter context window version.

**OpenRouter prompt (gpt-4o):** Same prompt, can handle more complex instructions.

### Prompt variables

| Variable | Source | Example |
|----------|--------|---------|
| `{primaryColor}` | `spec.theme.primaryColor` | `#1a1a2e` |
| `{secondaryColor}` | `spec.theme.secondaryColor` | `#16213e` |
| `{fontFamily}` | `spec.theme.fontFamily` | `Inter` |
| `{borderRadius}` | `spec.theme.borderRadius` | `8px` |
| `{startupName}` | `blueprint.name` | `AI Lawyer` |
| `{industry}` | `blueprint.industry` | `Legal Tech` |
| `{description}` | `blueprint.description` | `AI-powered legal assistant` |
| `{targetAudience}` | `blueprint.targetAudience` | `Startup founders` |
| `{keyFeatures}` | `blueprint.keyFeatures` | `["Contract review", "Compliance"]` |
| `{solution}` | `blueprint.solution` | `Automated legal analysis` |
| `{pageName}` | `page.name` | `Home` |
| `{pageSlug}` | `page.slug` | `/` |
| `{sections}` | `JSON.stringify(page.sections)` | `[{"type":"hero","order":1,"content":{...}}]` |

---

## 4. HTML Validation Strategy

### File: `src/services/ai/validation.ts`

Add Zod schemas for rendered output:

```typescript
export const PageHTMLResultSchema = z.object({
  html: z.string()
    .min(500, "HTML too short — likely truncated or malformed")
    .refine(
      (html) => html.includes("<!DOCTYPE html") || html.includes("<html"),
      "HTML must contain <!DOCTYPE html> or <html> tag"
    )
    .refine(
      (html) => html.includes("<head"),
      "HTML must contain <head> section"
    )
    .refine(
      (html) => html.includes("<body"),
      "HTML must contain <body> section"
    )
    .refine(
      (html) => html.includes("</html>"),
      "HTML must be a complete document (closing </html> tag)"
    ),
  slug: z.string().min(1).startsWith("/"),
  title: z.string().min(1),
});

export const WebsiteResultSchema = z.object({
  pages: z.array(PageHTMLResultSchema).min(1),
  css: z.string().default(""),
  js: z.string().default(""),
});
```

### Validation steps (in order)

1. **JSON parse** — AI response must be valid JSON
2. **Schema validate** — Must match `PageHTMLResultSchema`
3. **Structure check** — HTML must have doctype, head, body, closing html tag
4. **Length check** — HTML must be > 500 characters (not truncated)
5. **Content check** — HTML must not be a template error message (e.g., "I cannot generate...")
6. **Deduplication check** — HTML should not be identical to another page (AI sometimes repeats)

### Validation in the renderer

```typescript
function validateRenderedPage(raw: string, pageName: string): PageHTMLResult {
  const parsed = JSON.parse(cleanJSONResponse(raw));
  const validated = PageHTMLResultSchema.parse(parsed);

  // Additional runtime checks
  if (validated.html.length < 1000) {
    throw new Error(`Page "${pageName}" HTML too short (${validated.html.length} chars)`);
  }

  // Check for AI error messages embedded in HTML
  const errorPatterns = [
    "I cannot",
    "I'm sorry",
    "As an AI",
    "I don't have",
    "Unfortunately",
  ];
  for (const pattern of errorPatterns) {
    if (validated.html.includes(pattern)) {
      throw new Error(`Page "${pageName}" contains AI error message: "${pattern}"`);
    }
  }

  return validated;
}
```

---

## 5. CSS Strategy

### Approach: CSS in `<style>` tag per page, shared CSS in WebsiteResult.css

Each page gets a self-contained `<style>` block with theme-specific CSS. The shared `css` field in `WebsiteResult` contains base reset/normalize CSS.

### Shared CSS (WebsiteResult.css)

```css
/* Base reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--font, 'Inter', sans-serif); line-height: 1.6; color: #333; }
img { max-width: 100%; height: auto; }
a { color: inherit; text-decoration: none; }
```

### Per-page CSS (in `<style>` tag)

Each page includes:
1. CSS custom properties (theme variables)
2. Layout styles for that page's sections
3. Responsive breakpoints (mobile-first)
4. Hover/transition effects

### CSS validation

```typescript
function validateCSS(css: string): void {
  // Check for balanced braces
  const openBraces = (css.match(/{/g) || []).length;
  const closeBraces = (css.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    throw new Error(`CSS has unbalanced braces: ${openBraces} open, ${closeBraces} close`);
  }

  // Check for common AI CSS errors
  if (css.includes("undefined") || css.includes("null")) {
    throw new Error("CSS contains undefined/null values");
  }
}
```

---

## 6. Multi-Page Website Strategy

### Page generation approach

**One AI call per page.** NOT one giant call for all pages.

| Approach | Tokens | Failure Impact | Time |
|----------|--------|---------------|------|
| One call, all pages | 20K-40K | Entire website fails if truncated | 30-60s |
| One call per page | 4K-8K each | One page fails, rest succeed | 5-10s per page |

### Page generation order

1. Generate Home page first (most important, most complex)
2. Generate remaining pages in spec order
3. Each page is independent — can fail without affecting others

### Concurrency

**Sequential generation** (recommended for MVP):
- Pages generated one at a time
- Simpler error handling
- Easier to debug prompt issues
- Total time: 25-50s for 5 pages

**Parallel generation** (future optimization):
- Pages generated concurrently (max 3)
- Faster total time: 10-20s for 5 pages
- More complex error handling
- Add after MVP validates the approach

### Default page set

If the WebsiteSpec has pages, use those. If not, default to:

| Page | Slug | Sections |
|------|------|----------|
| Home | `/` | hero, features, cta |
| About | `/about` | mission, team, story |
| Features | `/features` | feature grid, details |
| Pricing | `/pricing` | pricing cards, faq |
| Contact | `/contact` | contact form, info |

---

## 7. Fallback Strategy

### When AI fails for a page

Each page generation is wrapped in try/catch. If AI fails:

1. Log the error with page name and provider
2. Generate a fallback HTML page from a template
3. Continue with remaining pages
4. Mark the page as `fallback: true` in the result

### Fallback templates

Create 3 minimal fallback templates in `src/services/renderer/fallbacks/`:

**`home.html`** — Hero + features + CTA:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{startupName}</title>
  <style>
    :root { --primary: {primaryColor}; --secondary: {secondaryColor}; }
    /* ~100 lines of basic responsive CSS */
  </style>
</head>
<body>
  <header><nav>{startupName}</nav></header>
  <main>
    <section class="hero">
      <h1>{startupName}</h1>
      <p>{description}</p>
      <a href="/features" class="cta">Learn More</a>
    </section>
    <section class="features">
      <!-- Feature cards from keyFeatures -->
    </section>
  </main>
  <footer>© {year} {startupName}</footer>
</body>
</html>
```

**`about.html`** — Mission + team
**`generic.html`** — Any other page (minimal layout)

### Fallback template variables

| Variable | Source |
|----------|--------|
| `{startupName}` | `blueprint.name` |
| `{description}` | `blueprint.description` |
| `{primaryColor}` | `spec.theme.primaryColor` |
| `{secondaryColor}` | `spec.theme.secondaryColor` |
| `{keyFeatures}` | `blueprint.keyFeatures` (array → HTML list) |
| `{year}` | `new Date().getFullYear()` |

### Fallback quality

Fallback templates are intentionally basic. They:
- Work on all devices (responsive)
- Apply the correct theme colors
- Include real content from the blueprint
- Are NOT beautiful — they're functional safety nets
- Ensure the website is never empty

---

## 8. Storage Strategy

### Website.content format

After rendering, `Website.content` stores:

```json
{
  "pages": [
    {
      "slug": "/",
      "title": "Home",
      "html": "<!DOCTYPE html><html lang=\"en\"><head>...</head><body>...</body></html>"
    },
    {
      "slug": "/about",
      "title": "About",
      "html": "<!DOCTYPE html>..."
    }
  ],
  "css": "*, *::before, *::after { box-sizing: border-box; } ...",
  "js": ""
}
```

### Storage location

- **Primary:** `Website.content` (Json column in Postgres) — already exists
- **Backup:** Supabase storage (optional, for large websites) — env vars already configured

### Size considerations

| Content | Size (est.) |
|---------|------------|
| Per page HTML | 5KB - 15KB |
| Shared CSS | 1KB - 3KB |
| JS | 0KB - 2KB (most pages are static) |
| Total (5 pages) | 25KB - 80KB |

Postgres Json column handles this easily. No need for external storage for MVP.

### Compression

For large websites (>100KB total), consider:
- Gzip compression before storage
- Store compressed + uncompressed sizes
- Decompress on read

Not needed for MVP. Add if website sizes grow.

---

## 9. Deployment Integration Strategy

### Current deployment flow

```
POST /deployments/create
  → Create Deployment record (PENDING)
  → Create Job (PENDING)
  → Queue job
  → Worker: PENDING → BUILDING → LIVE (writes URL string)
```

### New deployment flow

```
POST /deployments/create
  → Check Website.status === "rendered" (NEW CHECK)
  → Create Deployment record (PENDING)
  → Create Job (PENDING)
  → Queue job
  → Worker:
      1. PENDING → BUILDING
      2. Read Website.content (pages + CSS + JS)
      3. Upload files to hosting platform
      4. Get real URL from hosting platform
      5. Store URL in Deployment.url
      6. BUILDING → LIVE
```

### Hosting platform options

| Platform | SDK | Deploy Speed | Free Tier | Complexity |
|----------|-----|-------------|-----------|------------|
| **Vercel** | `vercel` npm package | ~10s | 100GB bandwidth/mo | Low |
| **Netlify** | `netlify` npm package | ~10s | 100GB bandwidth/mo | Low |
| **Cloudflare Pages** | `wrangler` npm package | ~5s | Unlimited bandwidth | Medium |
| **S3 + CloudFront** | AWS SDK | ~30s | 5GB storage, 20K requests/mo | High |

**Recommendation: Vercel** for MVP. Simple API, fast deploys, generous free tier.

### Vercel deployment steps

```typescript
// Pseudocode for handleDeployment worker
async function handleDeployment(job, startupId, payload) {
  // 1. Get website content
  const website = await prisma.website.findUnique({
    where: { id: payload.websiteId },
    include: { spec: true },
  });

  // 2. Build file list from Website.content
  const content = website.content as WebsiteResult;
  const files: Record<string, string> = {};

  for (const page of content.pages) {
    // Each page gets its own HTML file
    const path = page.slug === "/" ? "/index.html" : `${page.slug}/index.html`;
    files[path] = page.html;
  }

  // 3. Add shared CSS as separate file
  if (content.css) {
    files["/styles.css"] = content.css;
  }

  // 4. Deploy to Vercel
  const deployment = await vercel.deploy({
    name: `startupos-${website.id}`,
    files,
    // ... Vercel config
  });

  // 5. Store real URL
  await prisma.deployment.update({
    where: { id: payload.deploymentId },
    data: {
      status: "LIVE",
      url: deployment.url, // e.g., "https://startupos-abc123.vercel.app"
    },
  });
}
```

### File structure for deployment

```
/
├── index.html          (Home page)
├── about/
│   └── index.html      (About page)
├── features/
│   └── index.html      (Features page)
├── pricing/
│   └── index.html      (Pricing page)
├── contact/
│   └── index.html      (Contact page)
└── styles.css          (Shared CSS)
```

Each page's HTML links to `/styles.css` for shared styles.

### New env vars needed

```env
# Hosting platform
VERCEL_TOKEN=your-vercel-token
VERCEL_TEAM_ID=your-team-id  # optional

# Or Netlify
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-site-id
```

---

## 10. Error Handling

### Error categories

| Category | Example | Handling |
|----------|---------|----------|
| **AI timeout** | Provider takes >60s | Abort, try next provider, fallback template |
| **AI rate limit** | 429 response | Try next provider, exponential backoff |
| **AI malformed output** | Invalid JSON, missing fields | Validate, retry once, fallback template |
| **AI refusal** | "I cannot generate HTML" | Detect error patterns, fallback template |
| **Truncated output** | max_tokens hit mid-HTML | Length check, retry with shorter prompt, fallback template |
| **Validation failure** | HTML missing <body> tag | Schema validation, fallback template |
| **Hosting deploy failure** | Vercel API error | Retry 2x, then mark deployment FAILED |
| **Partial success** | 3 of 5 pages generated | Store partial result, mark failed pages as fallback |

### Error handling flow per page

```
1. Call AI provider
   ↓
2. Success? → Validate HTML → Pass? → Store page → Done
   ↓                        ↓
   NO                      NO
   ↓                        ↓
3. Try next provider    Log validation error
   ↓                    Generate fallback template
4. All failed?          Store fallback page
   ↓                    Mark page as fallback
5. Generate fallback
   Store fallback page
```

### Error response format

When website generation partially fails, the API response includes:

```json
{
  "jobId": "abc-123",
  "status": "COMPLETED",
  "websiteId": "xyz-789",
  "result": {
    "pagesGenerated": 4,
    "pagesTotal": 5,
    "fallbackPages": ["/pricing"],
    "providersUsed": ["FreeLLMAPI", "Groq"],
    "warnings": [
      "Page /pricing fell back to template: AI provider FreeLLMAPI returned malformed JSON"
    ]
  }
}
```

### Retry strategy

| Error | Retries | Backoff | Max |
|-------|---------|---------|-----|
| AI timeout | 1 per provider (3 total) | None | 3 |
| AI rate limit | 1 per provider (3 total) | None | 3 |
| AI malformed output | 1 per provider (3 total) | None | 3 |
| Hosting deploy failure | 2 | 5s, 10s | 2 |
| Partial page failure | 0 | — | Fallback template |

### Logging

Every error logs:
- `jobId` — for tracing
- `pageName` — which page failed
- `provider` — which AI provider was used
- `errorType` — timeout, rate_limit, malformed, validation, hosting
- `duration` — how long the call took
- `fallbackUsed` — boolean

---

## Implementation Checklist

### Phase 1: AI Page Generation (Days 1-3)

- [ ] Add `generateWebsitePage` to `AIProvider` interface (`src/types/ai.ts`)
- [ ] Add `PageHTMLResult` type (`src/types/ai.ts`)
- [ ] Add `PageHTMLResultSchema` Zod schema (`src/services/ai/validation.ts`)
- [ ] Implement `generateWebsitePage` in `FreeLLMProvider` (`src/services/ai/provider.ts`)
- [ ] Implement `generateWebsitePage` in `GroqProvider` (`src/services/ai/provider.ts`)
- [ ] Implement `generateWebsitePage` in `OpenRouterProvider` (`src/services/ai/provider.ts`)
- [ ] Add `generateWebsitePageWithFallback` function (`src/services/ai/provider.ts`)
- [ ] Increase `max_tokens` to 8192 in `callAPI` (`src/services/ai/provider.ts:37`)
- [ ] Add `WEBSITE_AI_TIMEOUT_MS` env var (default 60000) (`src/lib/env.ts`)

### Phase 2: Renderer + Validation (Days 3-5)

- [ ] Create `src/services/renderer/index.ts` — `renderWebsite(blueprint, spec) → WebsiteResult`
- [ ] Create `src/services/renderer/validate.ts` — HTML validation functions
- [ ] Create `src/services/renderer/fallbacks/home.html` — fallback template
- [ ] Create `src/services/renderer/fallbacks/about.html` — fallback template
- [ ] Create `src/services/renderer/fallbacks/generic.html` — fallback template
- [ ] Create `src/services/renderer/fallbacks/index.ts` — template registry

### Phase 3: Worker Integration (Day 5)

- [ ] Add rendering step to `handleWebsiteGeneration` (`src/queue/worker.ts`)
- [ ] Update `Website.content` from `{}` to rendered output
- [ ] Update `Website.status` from `spec_generated` to `rendered`
- [ ] Add partial success tracking (which pages succeeded vs. fallback)

### Phase 4: Deployment Integration (Days 6-8)

- [ ] Add `VERCEL_TOKEN` env var (`src/lib/env.ts`)
- [ ] Create `src/services/deploy/vercel.ts` — Vercel deployment logic
- [ ] Update `handleDeployment` worker to deploy real files (`src/queue/worker.ts`)
- [ ] Update `Deployment.url` with real Vercel URL
- [ ] Add deployment failure retry logic

### Phase 5: Public Pages (Days 8-9)

- [ ] Create `GET /public/:websiteId` route (no auth required)
- [ ] Serve `Website.content.pages` as HTML
- [ ] Add basic security headers
- [ ] Handle missing/undeployed websites gracefully

### Phase 6: Testing (Days 9-10)

- [ ] Generate 5 test websites across industries
- [ ] Verify HTML is valid and renders correctly
- [ ] Verify fallback templates work when AI fails
- [ ] Verify deployment to Vercel produces working URL
- [ ] Verify public URL serves the website
- [ ] Load test: 10 concurrent website generations

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/types/ai.ts` | Add `PageHTMLResult`, update `AIProvider` interface, update `WebsiteResult` |
| `src/services/ai/provider.ts` | Add `generateWebsitePage` to all providers, increase `max_tokens`, add fallback function |
| `src/services/ai/validation.ts` | Add `PageHTMLResultSchema`, `WebsiteResultSchema` |
| `src/queue/worker.ts` | Add rendering step to `handleWebsiteGeneration` |
| `src/lib/env.ts` | Add `WEBSITE_AI_TIMEOUT_MS`, `VERCEL_TOKEN` |
| `src/modules/deployments/deployment.handler.ts` | Add `Website.status === "rendered"` check |

## New Files

| File | Purpose |
|------|---------|
| `src/services/renderer/index.ts` | Main renderer (orchestrates page generation) |
| `src/services/renderer/validate.ts` | HTML/CSS validation functions |
| `src/services/renderer/fallbacks/home.html` | Fallback home page template |
| `src/services/renderer/fallbacks/about.html` | Fallback about page template |
| `src/services/renderer/fallbacks/generic.html` | Fallback generic page template |
| `src/services/renderer/fallbacks/index.ts` | Template registry |
| `src/services/deploy/vercel.ts` | Vercel deployment integration |
| `src/modules/public/public.routes.ts` | Public website serving (no auth) |
