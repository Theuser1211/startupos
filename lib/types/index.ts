export interface InterviewData {
  idea: string;
  stage: "ideation" | "pre-seed" | "seed" | "growth";
  industry:
    | "saas" | "fintech" | "healthtech" | "ecommerce" | "ai"
    | "devtools" | "climate" | "edtech" | "gaming" | "creator"
    | "marketplace" | "hardware" | "services" | "other";
  industryOther?: string;
  targetCustomer:
    | "b2b-small" | "b2b-medium" | "b2b-enterprise" | "b2c-mass"
    | "b2c-niche" | "b2c-premium" | "marketplace-supply" | "marketplace-demand";
  businessModel: "subscription" | "usage" | "one-time" | "marketplace" | "free";
  priceRange?: "<$10" | "$10-50" | "$50-200" | "$200-1000" | "$1000+";
  problem: "cost" | "access" | "performance" | "integration" | "security" | "other";
  problemOther?: string;
}

export const STAGE_LABELS: Record<string, string> = {
  ideation: "Ideation — just an idea, no product yet",
  "pre-seed": "Pre-Seed — building MVP, no revenue",
  seed: "Seed — shipped product, early customers",
  growth: "Growth — product-market fit, scaling",
};

export const INDUSTRY_LABELS: Record<string, string> = {
  saas: "SaaS / Software", fintech: "FinTech", healthtech: "HealthTech / Bio",
  ecommerce: "E-Commerce / Retail", ai: "AI / ML / Infrastructure",
  devtools: "Developer Tools", climate: "Climate / CleanTech",
  edtech: "EdTech", gaming: "Gaming", creator: "Creator Economy",
  marketplace: "Marketplace", hardware: "Hardware / IoT",
  services: "Professional Services", other: "Other",
};

export const CUSTOMER_LABELS: Record<string, string> = {
  "b2b-small": "Small Businesses (B2B, <50 employees)",
  "b2b-medium": "Mid-Market (B2B, 50-500 employees)",
  "b2b-enterprise": "Enterprise (B2B, 500+ employees)",
  "b2c-mass": "Mass Market (B2C, everyone)",
  "b2c-niche": "Niche Enthusiasts (B2C, specific audience)",
  "b2c-premium": "Premium / Luxury (B2C, high-end)",
  "marketplace-supply": "Marketplace — supply side first",
  "marketplace-demand": "Marketplace — demand side first",
};

export const BUSINESS_MODEL_LABELS: Record<string, string> = {
  subscription: "Subscription (monthly/yearly per seat)",
  usage: "Usage-based (pay-as-you-go, API calls)",
  "one-time": "One-time sale (perpetual license, hardware)",
  marketplace: "Marketplace commission (take rate %)",
  free: "Free (ad-supported, open-source, data monetization)",
};

export const PRICE_RANGE_LABELS: Record<string, string> = {
  "<$10": "Under $10/mo", "$10-50": "$10 – $50/mo",
  "$50-200": "$50 – $200/mo", "$200-1000": "$200 – $1,000/mo",
  "$1000+": "Over $1,000/mo",
};

export const PROBLEM_LABELS: Record<string, string> = {
  cost: "Too expensive / time-consuming — Cost & complexity",
  access: "Too hard to find / access — Access & availability",
  performance: "Too slow / unreliable — Performance & reliability",
  integration: "Too fragmented / disconnected — Integration & workflow",
  security: "Too risky / insecure — Security & compliance",
  other: "Something else",
};

export interface Startup {
  id: string;
  name: string;
  idea?: string;
  description?: string;
  industry?: string;
  stage?: string;
  logo?: string | null;
  createdAt?: string;
  updatedAt?: string;
  blueprint?: unknown;
  websites?: unknown[];
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export type BlueprintMeta = "pass" | "conditional" | "needs-work" | "fail";

export interface StartupBlueprint {
  startupName: string;
  tagline: string;
  problem: string;
  solution: string;
  companySnapshot: {
    stage: string;
    industry: string;
    funding: string;
    teamSize: number;
    foundedDate: string;
  };
  stats: {
    brandScore: number;
    marketFit: string;
    readiness: number;
    growthScore: number;
  };
  insights: {
    title: string;
    description: string;
    type: "positive" | "opportunity" | "warning" | "action";
  }[];
  website: {
    url: string;
    summary: string;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
  brand: {
    mission: string;
    values: string[];
    tone: string[];
    colors: { name: string; hex: string }[];
    typography: { heading: string; body: string };
  };
  generationMetadata?: {
    provider: string;
    model: string;
    generatedAt: string;
    generationTime: number;
  };
  logos: {
    id: string;
    description: string;
    style: string;
    preview: string;
    colors: string[];
  }[];
  icp: {
    title: string;
    role: string;
    companySize: string;
    description: string;
    painPoints: string[];
    goals: string[];
    objections: string[];
    recommendations: string[];
  };
  competitors: {
    name: string;
    strength: string;
    weakness: string;
    opportunity: string;
  }[];
  revenue: {
    model: string;
    pricing: string;
    justification: string;
    projections: { month: string; projected: number; actual: number | null }[];
    funding: string;
    analysis: string;
  };
  roadmap: {
    quarter: string;
    items: { title: string; description: string; status: "done" | "in-progress" | "planned" }[];
  }[];
  roast: {
    score: number;
    verdict: string;
    risks: string[];
    recommendations: string[];
    items: {
      category: string;
      rating: number;
      feedback: string;
      severity: "low" | "medium" | "high";
    }[];
  };
  verdict: {
    badge: "pass" | "conditional" | "needs-work" | "fail";
    badgeLabel: string;
    compositeScore: number;
    summary: string;
    dimensions: {
      market: { score: number; label: string; description: string };
      timing: { score: number; label: string; description: string };
      competition: { score: number; label: string; description: string };
      defensibility: { score: number; label: string; description: string };
      founderFit: { score: number; label: string; description: string };
      distribution: { score: number; label: string; description: string };
      revenue: { score: number; label: string; description: string };
    };
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
    improvementPaths: {
      dimension: string;
      action: string;
      scoreGain: number;
      risk: string | null;
      scoreLoss: number | null;
    }[];
  };
}

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  result?: unknown;
  error?: string;
  created_at?: string;
}

export type DeploymentStatus = "pending" | "building" | "deployed" | "failed";

export interface Website {
  id: string;
  spec?: Record<string, unknown>;
  deployment_url?: string;
  deployment_status?: string;
  created_at?: string;
}
