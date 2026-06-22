# StartupOS — Website Generation Architecture

> Audit date: 2026-06-19
> Decision: Template rendering vs. Direct AI generation

---

## The Two Approaches

### Approach A: Template Renderer

```
Blueprint
    ↓
WebsiteSpec (JSON: pages, sections, theme)
    ↓
Template Engine (deterministic, no AI)
    ↓
HTML/CSS/JS per page
```

The AI generates a design document. A template engine fills in HTML structure, applies CSS, and produces static files. The AI never sees or writes HTML.

### Approach B: Direct AI Generation

```
Blueprint
    ↓
AI (generates complete HTML/CSS/JS)
    ↓
HTML/CSS/JS per page
```

The AI generates the actual website code. No intermediate spec step. Each page is a separate AI call that produces a complete HTML file with inline CSS.

---

## Question 1: Which Produces Higher Quality Websites?

**Direct AI generation wins.**

| Dimension | Template Renderer | AI Generation |
|-----------|------------------|---------------|
| Visual uniqueness | Every "hero" section looks structurally identical across all startups | Every website looks different — unique layouts, colors, typography choices |
| Copy quality | AI generates copy in the spec step, templates just place it | AI generates copy AND designs the layout around it — holistic creative decisions |
| Industry adaptation | Templates are generic. A "hero" for a legal startup looks like a "hero" for a food startup. | AI understands context. A legal startup gets a professional, trust-building layout. A food startup gets vibrant, appetizing visuals. |
| Layout variety | Fixed templates. Every site has the same section order and structure. | AI can create asymmetric layouts, split screens, full-bleed images, unconventional section arrangements. |
| Design coherence | Templates enforce consistency (good) but at the cost of sameness (bad) | AI can maintain theme consistency while varying layout — the best of both worlds |

**Evidence:** Look at any AI website builder (Wix ADI, Hostinger AI, Framer AI). The ones using AI generation produce noticeably more unique and contextually appropriate designs than template-based builders.

**Template renderer advantage:** Predictable output. You always know what you'll get. But "predictable" is a liability when the product promise is "unique AI-generated websites."

---

## Question 2: Which Is Faster to Ship?

**Template renderer is faster to ship IF you need many templates. AI generation is faster to ship IF you need many unique outputs.**

| Factor | Template Renderer | AI Generation |
|--------|------------------|---------------|
| Initial build time | 3-5 days for core renderer + 5-10 section templates | 2-3 days for AI prompts + page generation logic |
| Per-section effort | Each new section type needs a new template (hero, features, pricing, testimonials, FAQ, team, contact...) = 15-20 templates | Each new section type = prompt update. AI handles it. |
| Time to first working website | 3-5 days | 2-3 days |
| Time to cover all section types | 2-3 weeks (15-20 templates) | Already covered by AI (no new code needed) |
| Maintenance burden | High — every template needs updates, responsive fixes, accessibility passes | Low — AI output is self-contained per page |

**Key insight:** Template rendering front-loads complexity. You build fast initially, then hit a wall when you need to support diverse section types. AI generation front-loads the AI prompt engineering, then scales effortlessly to new content types.

**For a 30-day launch:** AI generation is faster because you don't need to build and maintain 15-20 section templates. You need good prompts and a solid generation pipeline.

---

## Question 3: Which Scales Better to Many Industries?

**Direct AI generation wins decisively.**

| Industry | Template Renderer | AI Generation |
|----------|------------------|---------------|
| Legal Tech | Needs legal-specific template (trust signals, compliance badges) | AI understands legal conventions and generates appropriate design |
| Food & Beverage | Needs food-specific template (appetizing visuals, menu layouts) | AI generates food-appropriate design with warm colors, appetizing layout |
| SaaS | Needs SaaS-specific template (pricing tables, feature grids) | AI generates SaaS conventions (pricing, features, integrations) |
| Health Tech | Needs health-specific template (HIPAA badges, clean medical design) | AI understands health design conventions |
| Fintech | Needs fintech-specific template (security signals, compliance) | AI generates trust-building financial design |

**Template renderer problem:** You'd need to build industry-specific templates for every vertical. That's 10-20 industries × 5-10 section types = 50-200 template files. This doesn't scale.

**AI generation advantage:** The AI already knows industry conventions from its training data. A single prompt can generate appropriate designs for any industry. Zero new code needed.

---

## Question 4: Which Better Matches StartupOS's Promise?

**Direct AI generation.**

StartupOS promises: "AI-powered startup website generation."

The word "AI" is in the brand. Users expect AI to do the creative work, not just fill in a template. If the output looks like every other template-based site, the AI promise is broken.

**User expectation:**
- "I describe my startup → AI creates a unique website for me"
- NOT: "I describe my startup → AI fills in a template that looks like everyone else's"

**Competitive positioning:** Every competitor (Wix, Squarespace, Carrd) has templates. StartupOS's differentiator is AI generation. Using templates undermines the core value proposition.

---

## Question 5: Can We Use AI Generation First and Add Template Fallbacks Later?

**Yes. This is the recommended approach.**

### The Hybrid Architecture

```
Blueprint + WebsiteSpec
        ↓
   AI generates page
        ↓
   ┌─── Success? ───┐
   │                 │
  YES               NO
   │                 │
   ▼                 ▼
Store HTML      Template fallback
                for this page only
```

**How it works:**

1. AI generates the WebsiteSpec (planning step — already works)
2. For each page, AI generates complete HTML/CSS/JS
3. If AI fails for a specific page (timeout, malformed output, rate limit), fall back to a template for THAT page only
4. The website is a mix of AI-generated pages and template pages (best effort)

**Benefits:**
- AI-generated pages look unique and high-quality
- Template fallback ensures the website is never empty
- Partial AI success is better than total failure
- Templates can be minimal (just a reasonable default) — they don't need to be beautiful

**Fallback template scope:** Only 3-5 basic templates needed:
- `home.html` — Hero + features + CTA (covers most homepages)
- `about.html` — Team + mission + story
- `pricing.html` — Pricing cards
- `contact.html` — Contact form + info
- `generic.html` — Any other page

These are safety nets, not the primary output.

---

## Recommended Architecture: AI-First with Template Fallback

### Why AI-First

1. **Matches brand promise** — "AI-generated websites" means AI does the creative work
2. **Higher quality** — Unique layouts, contextual design, industry-aware
3. **Scales to any industry** — No per-industry templates needed
4. **Faster to ship** — 2-3 days for AI pipeline vs. 2-3 weeks for comprehensive templates
5. **Lower maintenance** — AI output is self-contained. No template debugging.

### Why Template Fallback

1. **Reliability** — AI can fail (timeout, rate limit, malformed output). Fallback ensures the website is never empty.
2. **Partial success** — If 4 of 5 pages generate successfully, only 1 page falls back to template.
3. **Minimal effort** — 3-5 basic templates as safety nets. Not the primary output.

### The Pipeline

```
Step 1: AI generates WebsiteSpec (ALREADY EXISTS)
        Input: Blueprint
        Output: { pages, theme, components }
        Model: gpt-4o-mini / llama-3.3-70b / gpt-4o
        Tokens: ~500-1500 output

Step 2: AI generates complete website (NEW)
        Input: Blueprint + WebsiteSpec
        Output: { pages: [{ name, html }], css, js }
        Model: gpt-4o-mini / llama-3.3-70b / gpt-4o
        Tokens: ~4000-8000 per page (5 pages = 20K-40K total)
        Strategy: One AI call per page (not one giant call)

Step 3: Template fallback for failed pages (NEW)
        Input: WebsiteSpec page that AI failed to generate
        Output: Basic HTML page from template
        Scope: 3-5 fallback templates only

Step 4: Store rendered output (MODIFY EXISTING)
        Website.content = { pages: [...], css, "..." }
        Website.status = "rendered"
```

### Why Per-Page Generation (Not One Giant Call)

| Approach | Tokens | Failure Impact | Time |
|----------|--------|---------------|------|
| One call for all pages | 20K-40K | Entire website fails if malformed | 30-60s |
| One call per page | 4K-8K per page | Only one page fails, rest succeed | 5-10s per page |

Per-page generation is more resilient. If page 3 fails, pages 1-2 are already done. The user gets a partially working website instead of nothing.

### Token Requirements

The current `max_tokens: 4096` is insufficient for HTML generation. Required changes:

| Current | Needed | Reason |
|---------|--------|--------|
| `max_tokens: 4096` | `max_tokens: 8192` | A complete HTML page with inline CSS is 3K-6K tokens |
| `timeout: 45s` | `timeout: 60s` | HTML generation takes longer than JSON spec generation |

These are safe increases. gpt-4o-mini supports 16K output tokens. llama-3.3-70b supports 32K context. gpt-4o supports 16K output.

### Cost Analysis

| Step | Tokens (est.) | Cost per Website |
|------|--------------|-----------------|
| Blueprint generation | ~1K output | ~$0.001 |
| WebsiteSpec generation | ~1.5K output | ~$0.001 |
| Website generation (5 pages × 5K tokens) | ~25K output | ~$0.015 |
| **Total** | **~27.5K output** | **~$0.017** |

At $0.017 per website, you can generate 5,800 websites for $100. This is viable.

### Validation Strategy

AI-generated HTML needs validation before storage:

```typescript
interface RenderedPage {
  name: string;
  slug: string;
  html: string;  // Must contain <!DOCTYPE html> or <html>
}

interface RenderedWebsite {
  pages: RenderedPage[];
  css: string;
  js: string;
}
```

Validation checks:
1. `html` contains valid HTML structure (doctype, html tag, head, body)
2. `html` length > 500 characters (not truncated)
3. `css` is valid CSS (no syntax errors)
4. At least 1 page generated successfully

If validation fails → template fallback for that page.

### Implementation Scope

| Task | Est. Effort |
|------|-------------|
| AI prompt engineering for HTML generation (per page type) | 1-2 days |
| `generateWebsiteHTML()` function (calls AI per page) | 1 day |
| HTML validation (structure, length, completeness) | 0.5 day |
| Template fallback (3-5 basic templates) | 1-2 days |
| Wire into `handleWebsiteGeneration` worker | 0.5 day |
| Update `Website.content` schema and storage | 0.5 day |
| Zod validation for rendered output | 0.5 day |
| Increase `max_tokens` to 8192, timeout to 60s | 0.5 hour |
| Testing (generate 5 different industry websites) | 1 day |
| **Total** | **5-7 days** |

---

## Comparison Summary

| Question | Template Renderer | AI Generation | Winner |
|----------|------------------|---------------|--------|
| Quality | Generic, repetitive | Unique, contextual | **AI** |
| Speed to ship | 3-5 days core, 2-3 weeks full | 5-7 days full | **AI** |
| Industry scalability | Need per-industry templates | Works for any industry | **AI** |
| Brand alignment | Undermines "AI" promise | Delivers on "AI" promise | **AI** |
| Reliability | 100% (deterministic) | 90-95% (needs fallback) | Templates |
| Maintenance | High (template updates) | Low (prompt updates) | **AI** |

**Score: AI generation wins 5-1.**

---

## Final Recommendation

**Use AI generation as the primary approach. Add minimal template fallbacks for reliability.**

### If StartupOS launches in 30 days:

**Week 1-2:** Build AI website generation pipeline
- AI prompt for generating complete HTML pages
- Per-page generation with fallback
- HTML validation
- Wire into existing worker

**Week 3:** Build hosting integration
- Vercel/Netlify SDK for deploying rendered HTML
- Real URL generation
- Public share pages

**Week 4:** Polish and test
- Generate 10+ test websites across industries
- Fix prompt issues
- Add template fallbacks for edge cases
- Load testing

### What changes in the existing code:

1. `src/services/ai/provider.ts` — Add `generateWebsiteHTML()` method
2. `src/queue/worker.ts` — Add rendering step after spec generation
3. `src/lib/env.ts` — Increase `AI_TIMEOUT_MS` to 60000, `max_tokens` to 8192
4. `src/services/ai/validation.ts` — Add Zod schema for `RenderedWebsite`
5. `src/services/renderer/` — NEW: Template fallback system (minimal)
6. `prisma/schema.prisma` — No changes needed (Website.content is already Json)

### What does NOT change:

1. Blueprint generation — stays as-is
2. WebsiteSpec generation — stays as-is (planning step)
3. Deployment lifecycle — stays as-is
4. Job queue — stays as-is
5. Auth, startup CRUD — stays as-is

**The rendering layer is a 5-7 day addition to the existing pipeline, not a rewrite.**
