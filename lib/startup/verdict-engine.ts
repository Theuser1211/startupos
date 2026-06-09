import type { InterviewData } from "@/lib/types";

/* ─── Dimension Scores ─── */

export interface DimensionScore {
  score: number;
  label: string;
  description: string;
}

export interface VerdictDimensions {
  market: DimensionScore;
  timing: DimensionScore;
  competition: DimensionScore;
  defensibility: DimensionScore;
  founderFit: DimensionScore;
  distribution: DimensionScore;
  revenue: DimensionScore;
}

/* ─── Improvement Path ─── */

export interface ImprovementPath {
  dimension: string;
  action: string;
  scoreGain: number;
  risk: string | null;
  scoreLoss: number | null;
}

/* ─── Full Verdict ─── */

export interface VerdictResult {
  badge: "pass" | "conditional" | "needs-work" | "fail";
  badgeLabel: string;
  compositeScore: number;
  summary: string;
  dimensions: VerdictDimensions;
  strengths: { dimension: string; score: number; explanation: string }[];
  weaknesses: { dimension: string; score: number; explanation: string }[];
  fatalRisks: string[];
  suggestedPivot: string | null;
  confidence: number;
  confidenceLabel: string;
  confidenceBreakdown: {
    dataCompleteness: number;
    stageMaturity: number;
    dimensionAgreement: number;
    industrySignal: number;
  };
  improvementPaths: ImprovementPath[];
}

/* ─── Industry Modifier Tables ─── */

// Market: how large/growing is this industry?
const marketModifiers: Record<string, { base: number; label: string; description: string }> = {
  ai:        { base: 75, label: "Large & Growing",     description: "Enterprise AI spending projected to grow 40% YoY. Massive TAM with high willingness to pay." },
  fintech:   { base: 70, label: "Large & Regulated",   description: "Financial services represent a multi-trillion market. High barriers to entry but enormous opportunity." },
  healthtech:{ base: 65, label: "Large & Fragmented",  description: "Healthcare IT is a $500B+ market. Fragmented buyer landscape creates both opportunity and complexity." },
  ecommerce: { base: 60, label: "Large & Crowded",     description: "Global e-commerce exceeds $5T. Market is established but vertical niches remain underserved." },
  devtools:  { base: 70, label: "Large & Developer-led", description: "Developer tools market exceeds $80B. Strong PLG motion with high switching costs once adopted." },
  climate:   { base: 80, label: "Rapidly Expanding",   description: "Climate tech funding reached $15B+ in 2024. Regulatory tailwinds from CSRD and SEC rules create mandatory spending." },
  edtech:    { base: 55, label: "Large & Slow-moving", description: "Global education spending exceeds $6T. However, procurement cycles are 9-18 months." },
  gaming:    { base: 60, label: "Large & Volatile",    description: "Gaming market exceeds $200B. Highly competitive with platform dependency and short attention cycles." },
  creator:   { base: 65, label: "High Growth",         description: "Creator economy projected to reach $500B by 2027. Tool saturation is a risk." },
  marketplace:{base: 70, label: "Winner-Take-All",      description: "Marketplaces benefit from strong network effects. Large TAM but requires liquidity to unlock." },
  hardware:  { base: 55, label: "Capital-Intensive",   description: "Hardware markets are large but require 3x more capital and 2x more time than software." },
  services:  { base: 50, label: "Fragmented",          description: "Professional services is a massive but highly fragmented market. Slow technology adoption." },
  saas:      { base: 65, label: "Mature & Competitive", description: "SaaS is the most established startup category. Market exists but crowded with competitors." },
};

// Timing: is the market ready now?
const timingModifiers: Record<string, { base: number; label: string; description: string }> = {
  ai:        { base: 80, label: "Peak Timing",     description: "AI adoption is at an all-time high. Enterprise budgets are actively allocated to AI infrastructure." },
  fintech:   { base: 65, label: "Good Timing",     description: "Open banking and embedded finance are creating tailwinds. Regulatory clarity is improving." },
  healthtech:{ base: 55, label: "Cautious Timing", description: "Post-COVID digital health adoption has slowed. Sales cycles remain 12-18 months." },
  ecommerce: { base: 55, label: "Mature Timing",   description: "E-commerce growth is stabilizing post-pandemic. DTC brands face higher acquisition costs." },
  devtools:  { base: 75, label: "Strong Timing",   description: "Developer tool spend continues growing 20%+ YoY. AI coding assistants have opened new categories." },
  climate:   { base: 85, label: "Urgent Timing",   description: "Regulatory deadlines (SEC, CSRD) create mandatory spending. Net-zero commitments drive urgency." },
  edtech:    { base: 40, label: "Challenging Timing", description: "Post-COVID edtech funding has declined 50%+. School budget cycles are locked 12-18 months ahead." },
  gaming:    { base: 50, label: "Crowded Timing",  description: "Steam released 14K+ games in 2024. Discovery is harder than development. Market is saturated." },
  creator:   { base: 60, label: "Growing Timing",  description: "Creator monetization tools are in demand. Platform risk is high as YouTube/TikTok build competing features." },
  marketplace:{base: 60, label: "Cyclical Timing",  description: "Marketplace adoption follows macro conditions. Current environment favors value-oriented platforms." },
  hardware:  { base: 45, label: "Capital-Timing Gap", description: "Hardware requires long lead times. Current VC environment favors capital-efficient software startups." },
  services:  { base: 60, label: "Transforming Timing", description: "AI disruption is forcing professional services firms to modernize. Incumbents are slow to adapt." },
  saas:      { base: 60, label: "Steady Timing",   description: "SaaS adoption remains strong. Macro headwinds are offset by the structural shift to cloud." },
};

// Competition: how hard is the competitive landscape?
const competitionModifiers: Record<string, { base: number; label: string; description: string }> = {
  ai:        { base: 35, label: "Hyperscaler Threat",    description: "Competing against AWS, GCP, and Azure. Open-source models (Llama, Mistral) erode differentiation." },
  fintech:   { base: 40, label: "Incumbent Dominance",   description: "Stripe, Plaid, and legacy banking cores create high barriers. Regulatory moats protect incumbents." },
  healthtech:{ base: 45, label: "Entrenched Incumbents", description: "Epic and Cerner control 70%+ of hospital EMR market. Integration-dependent market." },
  ecommerce: { base: 30, label: "Amazon & Shopify Duopoly", description: "Amazon controls 40%+ of US e-commerce. Shopify powers 20%+ of online stores." },
  devtools:  { base: 40, label: "Open-Source Threat",   description: "Free open-source alternatives exist for most developer tools. Competing on features alone is difficult." },
  climate:   { base: 50, label: "Fragmented Competition", description: "Climate tech is still emerging. Watershed, Persefoni exist but no clear winner. Regulatory changes shift landscape." },
  edtech:    { base: 45, label: "Platform Dominance",   description: "Canvas and Blackboard dominate LMS. Free alternatives (Khan Academy) set price expectations at $0." },
  gaming:    { base: 35, label: "Platform Gatekeepers",  description: "Unity and Unreal own game engines. Steam takes 30% of revenue. Platform dependency is existential." },
  creator:   { base: 35, label: "Platform Risk",         description: "YouTube, TikTok, and Instagram can build competing tools overnight. Your moat is community, not code." },
  marketplace:{base: 40, label: "Network Effects Race",  description: "Marketplaces winner-take-all. Incumbents (Airbnb, Uber, Upwork) have liquidity advantages." },
  hardware:  { base: 50, label: "Supply Chain Competition", description: "Manufacturing competition is global. Chinese suppliers offer lower costs but IP risks." },
  services:  { base: 55, label: "Low-Tech Competition",  description: "Professional services incumbents have brand trust but outdated technology. Opportunity for disruption." },
  saas:      { base: 35, label: "Highly Crowded",        description: "Every SaaS category has 20+ funded competitors. Differentiation is difficult without vertical focus." },
};

// Defensibility: how hard is it to copy?
const defensibilityModifiers: Record<string, { base: number; label: string; description: string }> = {
  ai:        { base: 45, label: "Data Moat Potential",   description: "Model quality improves with proprietary data. But models themselves are increasingly commoditized." },
  fintech:   { base: 70, label: "Regulatory Moat",        description: "Licensing (bank charters, money transmitter licenses) creates multi-year barriers to entry." },
  healthtech:{ base: 65, label: "Compliance Moat",        description: "HIPAA, SOC 2, and FDA clearance create significant barriers. Integration depth adds switching costs." },
  ecommerce: { base: 30, label: "Low Switching Costs",    description: "Merchants can switch platforms in weeks. Logistics moats are expensive to build." },
  devtools:  { base: 50, label: "Workflow Lock-in",       description: "Developers resist switching once integrated into CI/CD pipeline. But open-source alternatives reduce lock-in." },
  climate:   { base: 60, label: "Data Network Effects",   description: "More customers = better emissions data models. Regulatory compliance creates retention." },
  edtech:    { base: 50, label: "Contract Lock-in",       description: "School contracts are 3-5 years. But faculty adoption is fragile and easy to lose." },
  gaming:    { base: 35, label: "Platform Dependency",    description: "Games built on your engine can migrate. Content libraries and asset marketplaces create stickiness." },
  creator:   { base: 25, label: "Low Defensibility",      description: "Creators churn at 5-8% monthly. Switching tools takes hours, not months." },
  marketplace:{base: 60, label: "Liquidity Moat",         description: "Network effects are defensible once achieved. But cold-start vulnerability is extreme." },
  hardware:  { base: 55, label: "Manufacturing Moat",     description: "Supply chain relationships take years to build. Certification (FCC, CE) adds barriers." },
  services:  { base: 45, label: "Relationship-Based",     description: "Client relationships are sticky but not scalable. Technology layer adds defensibility." },
  saas:      { base: 35, label: "Low Switching Costs",    description: "SaaS customers churn when switching costs are low. Data portability and workflow integration create stickiness." },
};

// Founder-Fit: does the founder understand the problem?
const founderFitBase = 60; // Base score, adjusted by industry and stage

// Distribution: can they reach customers?
const distributionModifiers: Record<string, { base: number; label: string; description: string }> = {
  ai:        { base: 55, label: "Enterprise Sales",       description: "AI infrastructure requires technical sales. PLG works for bottom-up adoption." },
  fintech:   { base: 40, label: "Regulated Distribution", description: "Financial services require compliance-heavy sales. Partnerships with banks accelerate distribution." },
  healthtech:{ base: 35, label: "Complex Healthcare Sales", description: "Hospital procurement requires multiple stakeholders. Starting with clinics bypasses enterprise sales." },
  ecommerce: { base: 65, label: "Digital-First",           description: "E-commerce tools can be self-serve. Content marketing and SEO drive organic growth." },
  devtools:  { base: 75, label: "PLG-Native",              description: "Developers discover tools through GitHub, blogs, and Hacker News. Freemium drives adoption." },
  climate:   { base: 45, label: "Regulatory-Led Sales",    description: "ESG compliance creates buyer urgency. CFOs control budgets, not CSOs." },
  edtech:    { base: 30, label: "Long Sales Cycles",       description: "School districts lock budgets 12-18 months ahead. Corporate L&D has faster procurement." },
  gaming:    { base: 60, label: "Community-Driven",        description: "Discord and Steam wishlists drive game discovery. Streaming and influencer marketing are key." },
  creator:   { base: 70, label: "Direct-to-Creator",       description: "Creators discover tools via social media and peer recommendations. Freemium models work well." },
  marketplace:{base: 50, label: "Dual-Sided Acquisition",  description: "Acquiring both supply and demand simultaneously is the hardest distribution challenge." },
  hardware:  { base: 35, label: "Physical Distribution",   description: "Retail distribution requires margins. Crowdfunding (Kickstarter) is a viable validation channel." },
  services:  { base: 55, label: "Relationship-Driven",     description: "Professional services sell through relationships and referrals. Partner ecosystems accelerate growth." },
  saas:      { base: 60, label: "Multi-Channel",           description: "SaaS companies use PLG, sales, and partnerships. Self-serve drives adoption, sales closes enterprise." },
};

// Revenue Potential
const revenueModifiers: Record<string, { base: number; label: string; description: string }> = {
  ai:        { base: 70, label: "High Unit Economics",    description: "AI infrastructure commands premium pricing. Usage-based models scale with customer growth." },
  fintech:   { base: 75, label: "Volume-Based Revenue",   description: "FinTech revenue scales with transaction volume. Interchange fees and spread provide margin." },
  healthtech:{ base: 60, label: "Per-Seat, Long-Term",    description: "Hospital software contracts are high-value (6-figure ACV) but long sales cycles." },
  ecommerce: { base: 45, label: "Thin Margins",           description: "E-commerce profit margins are 1-5%. Platform fees must align with merchant success." },
  devtools:  { base: 55, label: "Usage-Based Model",      description: "Developer tools monetize through seats, usage, or enterprise tiers. Free tier creates conversion challenge." },
  climate:   { base: 65, label: "Compliance-Driven",      description: "ESG reporting is mandatory for public companies. Regulatory mandates create inelastic demand." },
  edtech:    { base: 45, label: "Budget-Constrained",     description: "School budgets are fixed and slow-moving. Per-student pricing caps revenue in K-12." },
  gaming:    { base: 50, label: "Revenue Share Model",    description: "Game engine revenue share models work. Indie developers are cash-poor." },
  creator:   { base: 55, label: "Subscription + Commission", description: "Creators pay for tools but churn quickly. Freemium + premium features is the dominant model." },
  marketplace:{base: 65, label: "Take Rate Economics",     description: "Marketplace take rates of 15-25% generate strong margins. Unit economics proven." },
  hardware:  { base: 40, label: "Capital-Intensive",      description: "Hardware requires upfront tooling investment. Margins improve at scale but cash flow is challenging." },
  services:  { base: 55, label: "Recurring Revenue",      description: "Practice management software has high retention. Professional services firms have stable budgets." },
  saas:      { base: 65, label: "Proven SaaS Metrics",    description: "SaaS subscription model is the most venture-backable. Predictable recurring revenue." },
};

/* ─── Stage Modifiers ─── */

const stageScoreModifiers: Record<string, { market: number; timing: number; competition: number; defensibility: number; founderFit: number; distribution: number; revenue: number }> = {
  ideation:  { market: -5, timing: 0, competition: -10, defensibility: -15, founderFit: 5,  distribution: -15, revenue: -20 },
  "pre-seed":{ market: 0,  timing: 5,  competition: -5,  defensibility: -10, founderFit: 10, distribution: -10, revenue: -10 },
  seed:      { market: 5,  timing: 5,  competition: 0,   defensibility: 0,   founderFit: 5,  distribution: 0,   revenue: 0 },
  growth:    { market: 10, timing: 0,  competition: -5,  defensibility: 10,  founderFit: 0,  distribution: 10,  revenue: 15 },
};

/* ─── Problem Penalties ─── */

const problemPenalties: Record<string, { market?: number; timing?: number; competition?: number; defensibility?: number; distribution?: number; revenue?: number }> = {
  cost:        { market: -5, revenue: -5 },
  access:      { market: 10, distribution: 5 },
  performance: { competition: 5, defensibility: 5 },
  integration: { market: 5, defensibility: -5 },
  security:    { timing: -5, competition: 5, defensibility: 10 },
};

/* ─── Customer Type Modifiers ─── */

const customerDistributionModifiers: Record<string, number> = {
  "b2b-small":          5,
  "b2b-medium":         0,
  "b2b-enterprise":     -10,
  "b2c-mass":           15,
  "b2c-niche":          10,
  "b2c-premium":        0,
  "marketplace-supply": -5,
  "marketplace-demand": -5,
};

const customerRevenueModifiers: Record<string, number> = {
  "b2b-small":          5,
  "b2b-medium":         10,
  "b2b-enterprise":     20,
  "b2c-mass":           -10,
  "b2c-niche":          0,
  "b2c-premium":        10,
  "marketplace-supply": 5,
  "marketplace-demand": 5,
};

/* ─── Stage Confidence Scores ─── */

const stageConfidence: Record<string, number> = {
  ideation:   40,
  "pre-seed": 55,
  seed:       75,
  growth:     90,
};

/* ─── Industry signal strength ─── */

const industrySignalStrength: Record<string, number> = {
  ai: 85, fintech: 85, healthtech: 80, ecommerce: 80, devtools: 85,
  climate: 75, edtech: 80, gaming: 80, creator: 75, marketplace: 85,
  hardware: 80, services: 80, saas: 85, other: 40,
};

/* ─── Dimension descriptions for explainability ─── */

const dimensionExplanations: Record<string, { high: string; medium: string; low: string }> = {
  market: {
    high: "Your market is large, growing, and has strong tailwinds.",
    medium: "Your market has potential but faces growth or competitive challenges.",
    low: "Your market is small, crowded, or declining. Consider narrowing to a defensible vertical.",
  },
  timing: {
    high: "You're building at the right moment. Market conditions favor your entry.",
    medium: "Timing is reasonable but not optimal. Be prepared for longer cycles.",
    low: "Market conditions are challenging. Consider waiting for a catalyst or pivoting.",
  },
  competition: {
    high: "You have a clear competitive advantage in a market with limited rivals.",
    medium: "Competition exists but there's room for differentiation.",
    low: "You face entrenched competitors with significant advantages.",
  },
  defensibility: {
    high: "Strong moats protect your business from competitors.",
    medium: "Moderate defensibility. Build switching costs and network effects.",
    low: "Low defensibility. Focus on building moats before competitors replicate your product.",
  },
  founderFit: {
    high: "Strong founder-market fit. You deeply understand the problem.",
    medium: "Good understanding of the problem. Domain expertise will deepen with time.",
    low: "Consider whether you're the right person to solve this problem.",
  },
  distribution: {
    high: "Strong go-to-market motion. You can reach customers efficiently.",
    medium: "Distribution is viable but needs refinement.",
    low: "Customer acquisition is a critical risk. Rethink your distribution strategy.",
  },
  revenue: {
    high: "Strong unit economics with clear path to revenue.",
    medium: "Revenue model is viable but needs optimization.",
    low: "Revenue model is unproven or has poor unit economics.",
  },
};

/* ─── Improvement Path Templates ─── */

const improvementTemplates: Record<string, { action: string; gain: number; risk: string; loss: number }[]> = {
  market: [
    { action: "Narrow from broad market to a specific vertical", gain: 10, risk: "Expand too early into adjacent verticals", loss: 8 },
    { action: "Publish industry-specific thought leadership", gain: 5, risk: "Ignore category creation in favor of feature-building", loss: 5 },
  ],
  timing: [
    { action: "Ship MVP and get first 10 design partners", gain: 12, risk: "Delay launch by 6+ months for perfection", loss: 15 },
    { action: "Launch before a major competitor fills the space", gain: 8, risk: "Pause development during fundraising", loss: 10 },
  ],
  competition: [
    { action: "Identify and amplify your unfair advantage", gain: 10, risk: "A well-funded competitor enters your space", loss: 12 },
    { action: "Build integration moats with existing tools", gain: 7, risk: "Ignore competitive positioning in messaging", loss: 6 },
  ],
  defensibility: [
    { action: "File provisional patents or build proprietary data assets", gain: 12, risk: "Open-source your core differentiator", loss: 15 },
    { action: "Build network effects into your product", gain: 10, risk: "Single-tenant architecture limits switching costs", loss: 8 },
  ],
  founderFit: [
    { action: "Work in the industry you're disrupting for 3 months", gain: 8, risk: "Hire a CEO who doesn't understand the problem", loss: 12 },
    { action: "Publish a domain authority piece (whitepaper, talk)", gain: 5, risk: "Outsource problem understanding to customer interviews", loss: 5 },
  ],
  distribution: [
    { action: "Launch a self-serve onboarding flow", gain: 10, risk: "Rely entirely on outbound enterprise sales", loss: 12 },
    { action: "Build a referral or viral loop mechanism", gain: 8, risk: "Ignore SEO and content marketing", loss: 7 },
  ],
  revenue: [
    { action: "Pre-sell to 3 customers before building", gain: 15, risk: "Increase burn without proving willingness-to-pay", loss: 15 },
    { action: "Right-size pricing based on customer discovery", gain: 8, risk: "Set pricing too low for sustainable unit economics", loss: 10 },
  ],
};

/* ─── Helper: clamp a value between 0 and 100 ─── */

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/* ─── Helper: compute standard deviation ─── */

function standardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/* ─── Score a single dimension ─── */

function _scoreDimension(
  base: number,
  industryKey: string,
  stage: string,
  problem: string,
  stageMods: Record<string, number>,
  additionalMods?: { [dim: string]: number },
): number {
  let s = base;
  s += stageMods[stage] ?? 0;

  if (problemPenalties[problem]) {
    const _pp = problemPenalties[problem];
    // We apply industryKey-specific problem adjustments generically
    // The problem penalty function is dimension-agnostic, applied by caller
  }

  if (additionalMods) {
    for (const [, mod] of Object.entries(additionalMods)) {
      s += mod;
    }
  }

  return clamp(s);
}

/* ─── Main Engine ─── */

export function computeVerdict(data: InterviewData): VerdictResult {
  const industry = data.industry === "other" ? "saas" : data.industry;
  const stage = data.stage;
  const problem = data.problem;
  const customer = data.targetCustomer;

  // ---- Score each dimension ----
  const stageMods = stageScoreModifiers[stage] || stageScoreModifiers.ideation;

  const marketMod = marketModifiers[industry] || marketModifiers.saas;
  const market = {
    score: clamp(marketMod.base + stageMods.market + (problemPenalties[problem]?.market ?? 0)),
    label: marketMod.label,
    description: marketMod.description,
  };

  const timingMod = timingModifiers[industry] || timingModifiers.saas;
  const timing = {
    score: clamp(timingMod.base + stageMods.timing + (problemPenalties[problem]?.timing ?? 0)),
    label: timingMod.label,
    description: timingMod.description,
  };

  const compMod = competitionModifiers[industry] || competitionModifiers.saas;
  const competition = {
    score: clamp(compMod.base + stageMods.competition + (problemPenalties[problem]?.competition ?? 0)),
    label: compMod.label,
    description: compMod.description,
  };

  const defMod = defensibilityModifiers[industry] || defensibilityModifiers.saas;
  const defensibility = {
    score: clamp(defMod.base + stageMods.defensibility + (problemPenalties[problem]?.defensibility ?? 0)),
    label: defMod.label,
    description: defMod.description,
  };

  const founderFit = {
    score: clamp(founderFitBase + stageMods.founderFit + (stage === "ideation" ? 5 : 0)),
    label: stage === "ideation" ? "Early Stage" : stage === "growth" ? "Validated" : "Developing",
    description: stage === "ideation"
      ? "At ideation, founder-market fit is assumed based on your problem choice. Validate through customer discovery."
      : stage === "growth"
        ? "Your continued journey suggests strong founder-market alignment. Domain expertise grows with each iteration."
        : "Your founder-market fit is developing. Deeper domain expertise will strengthen your position.",
  };

  const distMod = distributionModifiers[industry] || distributionModifiers.saas;
  const distribution = {
    score: clamp(distMod.base + stageMods.distribution + (customerDistributionModifiers[customer] ?? 0)),
    label: distMod.label,
    description: distMod.description,
  };

  const revMod = revenueModifiers[industry] || revenueModifiers.saas;
  const revenue = {
    score: clamp(revMod.base + stageMods.revenue + (customerRevenueModifiers[customer] ?? 0) + (problemPenalties[problem]?.revenue ?? 0)),
    label: revMod.label,
    description: revMod.description,
  };

  const dimensions: VerdictDimensions = {
    market,
    timing,
    competition,
    defensibility,
    founderFit,
    distribution,
    revenue,
  };

  // ---- Composite score (weighted) ----
  const compositeScore = clamp(
    market.score         * 0.15 +
    timing.score         * 0.10 +
    competition.score    * 0.15 +
    defensibility.score  * 0.20 +
    founderFit.score     * 0.10 +
    distribution.score   * 0.10 +
    revenue.score        * 0.20,
  );

  // ---- Badge ----
  let badge: "pass" | "conditional" | "needs-work" | "fail";
  let badgeLabel: string;
  if (compositeScore >= 75) {
    badge = "pass";
    badgeLabel = "PASS";
  } else if (compositeScore >= 55) {
    badge = "conditional";
    badgeLabel = "CONDITIONAL PASS";
  } else if (compositeScore >= 35) {
    badge = "needs-work";
    badgeLabel = "NEEDS WORK";
  } else {
    badge = "fail";
    badgeLabel = "FAIL";
  }

  // ---- Strengths & Weaknesses (top/bottom 2 dimensions) ----
  const dimEntries = Object.entries(dimensions).map(([key, val]) => ({
    dimension: key,
    score: val.score,
    label: val.label,
    explanation: val.score >= 70
      ? dimensionExplanations[key]?.high ?? "Strong performance in this area."
      : val.score >= 45
        ? dimensionExplanations[key]?.medium ?? "Adequate performance with room for growth."
        : dimensionExplanations[key]?.low ?? "Significant improvement needed here.",
  }));

  dimEntries.sort((a, b) => b.score - a.score);
  const strengths = dimEntries.slice(0, 2).map((d) => ({
    dimension: d.dimension,
    score: d.score,
    explanation: d.explanation,
  }));
  const weaknesses = dimEntries.slice(-2).reverse().map((d) => ({
    dimension: d.dimension,
    score: d.score,
    explanation: d.explanation,
  }));

  // ---- Summary ----
  const summary = `Your startup scored ${compositeScore}/100. ${dimEntries[0].dimension} is your strongest dimension (${dimEntries[0].score}/100). ${dimEntries[dimEntries.length - 1].dimension} needs the most attention (${dimEntries[dimEntries.length - 1].score}/100).`;

  // ---- Fatal risks (dimensions below 30) ----
  const fatalDim = dimEntries.filter((d) => d.score < 30);
  const fatalRisks: string[] = fatalDim.length > 0
    ? fatalDim.map((d) => `Critical weakness in ${d.dimension}: scored ${d.score}/100. ${dimensionExplanations[d.dimension]?.low ?? "Immediate attention required."}`)
    : [];

  // ---- Suggested pivot (when lowest dimension < 25) ----
  const lowestDim = dimEntries[dimEntries.length - 1];
  let suggestedPivot: string | null = null;
  if (lowestDim.score < 25) {
    const industryName = industry.charAt(0).toUpperCase() + industry.slice(1);
    suggestedPivot = `Your weakest dimension is ${lowestDim.dimension} (${lowestDim.score}/100). Consider rethinking your ${industryName} strategy to address this gap. ${improvementTemplates[lowestDim.dimension]?.[0]?.action ?? "Focus on shoring up fundamentals in this area."}`;
  }

  // ---- Confidence ----
  const dataCompleteness = (() => {
    let filled = 0;
    const total = 7;
    if (data.idea) filled++;
    if (data.stage) filled++;
    if (data.industry) filled++;
    if (data.targetCustomer) filled++;
    if (data.businessModel) filled++;
    if (data.priceRange) filled++;
    if (data.problem) filled++;
    return Math.round((filled / total) * 100);
  })();

  const stageMaturity = stageConfidence[stage] ?? 40;

  const dimScores = dimEntries.map((d) => d.score);
  const sd = standardDeviation(dimScores);
  const dimensionAgreement = clamp(100 - sd * 3);

  const industrySignal = industrySignalStrength[data.industry] ?? 40;

  const confidence = clamp(
    dataCompleteness * 0.30 +
    stageMaturity * 0.25 +
    dimensionAgreement * 0.25 +
    industrySignal * 0.20,
  );

  const confidenceLabel = confidence >= 80 ? "High" : confidence >= 55 ? "Moderate" : "Low";

  const confidenceBreakdown = {
    dataCompleteness,
    stageMaturity,
    dimensionAgreement,
    industrySignal,
  };

  // ---- Improvement paths ----
  const improvementPaths: ImprovementPath[] = dimEntries.map((d) => {
    const templates = improvementTemplates[d.dimension];
    if (!templates || templates.length === 0) {
      return {
        dimension: d.dimension,
        action: "Continue strengthening this area.",
        scoreGain: 0,
        risk: null,
        scoreLoss: null,
      };
    }
    // Show the improvement path for the lowest-scoring aspects
    const template = templates[0];
    return {
      dimension: d.dimension,
      action: template.action,
      scoreGain: template.gain,
      risk: template.risk,
      scoreLoss: template.loss,
    };
  });

  return {
    badge,
    badgeLabel,
    compositeScore,
    summary,
    dimensions,
    strengths,
    weaknesses,
    fatalRisks,
    suggestedPivot,
    confidence,
    confidenceLabel,
    confidenceBreakdown,
    improvementPaths,
  };
}
