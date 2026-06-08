export interface InterviewData {
  /** "Describe your startup idea in one sentence" — e.g. "AI lawyer for startups" */
  idea: string;

  /** Current stage of the startup */
  stage: "ideation" | "pre-seed" | "seed" | "growth";

  /** Primary industry */
  industry:
    | "saas"
    | "fintech"
    | "healthtech"
    | "ecommerce"
    | "ai"
    | "devtools"
    | "climate"
    | "edtech"
    | "gaming"
    | "creator"
    | "marketplace"
    | "hardware"
    | "services"
    | "other";

  /** Only when industry === "other" */
  industryOther?: string;

  /** Target customer archetype */
  targetCustomer:
    | "b2b-small"
    | "b2b-medium"
    | "b2b-enterprise"
    | "b2c-mass"
    | "b2c-niche"
    | "b2c-premium"
    | "marketplace-supply"
    | "marketplace-demand";

  /** Business model */
  businessModel: "subscription" | "usage" | "one-time" | "marketplace" | "free";

  /** Conditional: only when businessModel === "subscription" or "usage" */
  priceRange?: "<$10" | "$10-50" | "$50-200" | "$200-1000" | "$1000+";

  /** Core problem archetype */
  problem: "cost" | "access" | "performance" | "integration" | "security" | "other";

  /** Only when problem === "other" */
  problemOther?: string;
}

/** Human-readable labels for select options */
export const STAGE_LABELS: Record<InterviewData["stage"], string> = {
  ideation: "Ideation — just an idea, no product yet",
  "pre-seed": "Pre-Seed — building MVP, no revenue",
  seed: "Seed — shipped product, early customers",
  growth: "Growth — product-market fit, scaling",
};

export const INDUSTRY_LABELS: Record<InterviewData["industry"], string> = {
  saas: "SaaS / Software",
  fintech: "FinTech",
  healthtech: "HealthTech / Bio",
  ecommerce: "E-Commerce / Retail",
  ai: "AI / ML / Infrastructure",
  devtools: "Developer Tools",
  climate: "Climate / CleanTech",
  edtech: "EdTech",
  gaming: "Gaming",
  creator: "Creator Economy",
  marketplace: "Marketplace",
  hardware: "Hardware / IoT",
  services: "Professional Services",
  other: "Other",
};

export const CUSTOMER_LABELS: Record<InterviewData["targetCustomer"], string> = {
  "b2b-small": "Small Businesses (B2B, <50 employees)",
  "b2b-medium": "Mid-Market (B2B, 50-500 employees)",
  "b2b-enterprise": "Enterprise (B2B, 500+ employees)",
  "b2c-mass": "Mass Market (B2C, everyone)",
  "b2c-niche": "Niche Enthusiasts (B2C, specific audience)",
  "b2c-premium": "Premium / Luxury (B2C, high-end)",
  "marketplace-supply": "Marketplace — supply side first",
  "marketplace-demand": "Marketplace — demand side first",
};

export const BUSINESS_MODEL_LABELS: Record<InterviewData["businessModel"], string> = {
  subscription: "Subscription (monthly/yearly per seat)",
  usage: "Usage-based (pay-as-you-go, API calls)",
  "one-time": "One-time sale (perpetual license, hardware)",
  marketplace: "Marketplace commission (take rate %)",
  free: "Free (ad-supported, open-source, data monetization)",
};

export const PRICE_RANGE_LABELS: Record<string, string> = {
  "<$10": "Under $10/mo",
  "$10-50": "$10 – $50/mo",
  "$50-200": "$50 – $200/mo",
  "$200-1000": "$200 – $1,000/mo",
  "$1000+": "Over $1,000/mo",
};

export const PROBLEM_LABELS: Record<InterviewData["problem"], string> = {
  cost: "Too expensive / time-consuming — Cost & complexity",
  access: "Too hard to find / access — Access & availability",
  performance: "Too slow / unreliable — Performance & reliability",
  integration: "Too fragmented / disconnected — Integration & workflow",
  security: "Too risky / insecure — Security & compliance",
  other: "Something else",
};

/* ─── Database Types ─── */

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  role: string | null;
  onboarding_completed: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Startup {
  id: string;
  user_id: string;
  name: string;
  tagline: string | null;
  industry: string | null;
  stage: string | null;
  founded_date: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type BlueprintMeta = "pass" | "conditional" | "needs-work" | "fail";

export interface GeneratedLogo {
  id: string;
  user_id: string;
  startup_id: string | null;
  prompt: string;
  style: string | null;
  image_url: string;
  thumbnail_url: string | null;
  is_favorite: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type DeploymentStatus = "pending" | "building" | "deployed" | "failed";

export interface GeneratedWebsite {
  id: string;
  user_id: string;
  startup_id: string | null;
  template: string | null;
  deployment_url: string | null;
  deployment_status: DeploymentStatus;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type SubscriptionPlan = "free" | "starter" | "pro";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: string | null;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  canceled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  feature: string;
  count: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/** Feature names for usage tracking */
export const USAGE_FEATURES = {
  BLUEPRINT_GENERATE: "blueprint_generate",
  BLUEPRINT_REVIEW: "blueprint_review",
  LOGO_GENERATE: "logo_generate",
  WEBSITE_GENERATE: "website_generate",
  WEBSITE_DEPLOY: "website_deploy",
  ICP_ANALYSIS: "icp_analysis",
  REVENUE_ANALYSIS: "revenue_analysis",
  ROAST: "roast",
} as const;

/** Plan limits — adjust as needed */
export const PLAN_LIMITS: Record<SubscriptionPlan, { [key: string]: number }> = {
  free: {
    [USAGE_FEATURES.BLUEPRINT_GENERATE]: 3,
    [USAGE_FEATURES.BLUEPRINT_REVIEW]: 5,
    [USAGE_FEATURES.LOGO_GENERATE]: 1,
    [USAGE_FEATURES.WEBSITE_GENERATE]: 0,
    [USAGE_FEATURES.ICP_ANALYSIS]: 3,
    [USAGE_FEATURES.REVENUE_ANALYSIS]: 3,
    [USAGE_FEATURES.ROAST]: 1,
  },
  starter: {
    [USAGE_FEATURES.BLUEPRINT_GENERATE]: 20,
    [USAGE_FEATURES.BLUEPRINT_REVIEW]: 50,
    [USAGE_FEATURES.LOGO_GENERATE]: 10,
    [USAGE_FEATURES.WEBSITE_GENERATE]: 1,
    [USAGE_FEATURES.ICP_ANALYSIS]: 20,
    [USAGE_FEATURES.REVENUE_ANALYSIS]: 20,
    [USAGE_FEATURES.ROAST]: 10,
  },
  pro: {
    [USAGE_FEATURES.BLUEPRINT_GENERATE]: -1, // unlimited
    [USAGE_FEATURES.BLUEPRINT_REVIEW]: -1,
    [USAGE_FEATURES.LOGO_GENERATE]: -1,
    [USAGE_FEATURES.WEBSITE_GENERATE]: 20,
    [USAGE_FEATURES.ICP_ANALYSIS]: -1,
    [USAGE_FEATURES.REVENUE_ANALYSIS]: -1,
    [USAGE_FEATURES.ROAST]: -1,
  },
};
