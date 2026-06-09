import { composeIcp } from "@/lib/startup/domain-icp";
import type { InterviewData } from "@/lib/types";
import { computeVerdict } from "@/lib/startup/verdict-engine";

/* ─── Blueprint Type ─── */

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
      market: { score: number; label: string; description: string; };
      timing: { score: number; label: string; description: string; };
      competition: { score: number; label: string; description: string; };
      defensibility: { score: number; label: string; description: string; };
      founderFit: { score: number; label: string; description: string; };
      distribution: { score: number; label: string; description: string; };
      revenue: { score: number; label: string; description: string; };
    };
    strengths: { dimension: string; score: number; explanation: string; }[];
    weaknesses: { dimension: string; score: number; explanation: string; }[];
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

/* ─── Helpers ─── */

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const industryColorSchemes: Record<string, { name: string; hex: string }[]> = {
  ai: [
    { name: "Primary Purple", hex: "#7C3AED" },
    { name: "Electric Indigo", hex: "#6366F1" },
    { name: "Deep Space", hex: "#0A0A0F" },
    { name: "Silver Mist", hex: "#A1A1B5" },
  ],
  fintech: [
    { name: "Ocean Blue", hex: "#0EA5E9" },
    { name: "Teal", hex: "#14B8A6" },
    { name: "Navy", hex: "#0F172A" },
    { name: "Slate", hex: "#94A3B8" },
  ],
  healthtech: [
    { name: "Medical Green", hex: "#10B981" },
    { name: "Sky Blue", hex: "#38BDF8" },
    { name: "Clean White", hex: "#F8FAFC" },
    { name: "Graphite", hex: "#64748B" },
  ],
  ecommerce: [
    { name: "Orange", hex: "#F97316" },
    { name: "Amber", hex: "#F59E0B" },
    { name: "Dark", hex: "#1C1917" },
    { name: "Warm Gray", hex: "#A8A29E" },
  ],
  devtools: [
    { name: "Terminal Green", hex: "#22C55E" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Dark Slate", hex: "#0F172A" },
    { name: "Gray", hex: "#94A3B8" },
  ],
  climate: [
    { name: "Earth Green", hex: "#22C55E" },
    { name: "Ocean Blue", hex: "#06B6D4" },
    { name: "Forest", hex: "#064E3B" },
    { name: "Warm Beige", hex: "#D6D3D1" },
  ],
  edtech: [
    { name: "Learning Purple", hex: "#8B5CF6" },
    { name: "Sky", hex: "#0EA5E9" },
    { name: "Deep Blue", hex: "#1E3A5F" },
    { name: "Light Gray", hex: "#CBD5E1" },
  ],
  gaming: [
    { name: "Neon Pink", hex: "#EC4899" },
    { name: "Cyber Blue", hex: "#06B6D4" },
    { name: "Dark Void", hex: "#09090B" },
    { name: "Electric Purple", hex: "#A855F7" },
  ],
  creator: [
    { name: "Hot Pink", hex: "#F43F5E" },
    { name: "Amber", hex: "#F97316" },
    { name: "Dark", hex: "#1C1917" },
    { name: "Pearl", hex: "#E2E8F0" },
  ],
  marketplace: [
    { name: "Teal", hex: "#14B8A6" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Dark", hex: "#0F172A" },
    { name: "Light Gray", hex: "#E2E8F0" },
  ],
  hardware: [
    { name: "Industrial Yellow", hex: "#EAB308" },
    { name: "Steel Gray", hex: "#64748B" },
    { name: "Dark Iron", hex: "#1C1917" },
    { name: "Safety Orange", hex: "#F97316" },
  ],
  services: [
    { name: "Professional Blue", hex: "#2563EB" },
    { name: "Navy", hex: "#1E293B" },
    { name: "Cream", hex: "#F8FAFC" },
    { name: "Slate", hex: "#94A3B8" },
  ],
  saas: [
    { name: "Primary Purple", hex: "#7C3AED" },
    { name: "Electric Indigo", hex: "#6366F1" },
    { name: "Deep Space", hex: "#0A0A0F" },
    { name: "Silver Mist", hex: "#A1A1B5" },
  ],
};

const logoConcepts: Record<string, { description: string; style: string }[]> = {
  ai: [
    { description: "Geometric letter mark with circuit-board lines representing neural networks", style: "Minimalist / Tech" },
    { description: "Abstract brain node with connecting dots in a constellation pattern", style: "Abstract / Creative" },
    { description: "Interlocking hexagons forming the first letter — unity and complexity", style: "Modern / Geometric" },
  ],
  fintech: [
    { description: "Shield-like shape with a rising arrow symbolizing security and growth", style: "Professional / Trust" },
    { description: "Abstract 'F' merged with a bar chart — financial movement", style: "Modern / Dynamic" },
    { description: "Interlocking circles representing connected financial ecosystems", style: "Connected / Global" },
  ],
  healthtech: [
    { description: "Leaf combined with a heartbeat line — natural meets clinical", style: "Organic / Medical" },
    { description: "Simplified cross symbol with overlapping gradient layers", style: "Minimalist / Clean" },
    { description: "Abstract DNA helix forming the first letter of your brand", style: "Scientific / Biotech" },
  ],
  ecommerce: [
    { description: "Shopping bag icon with a curved arrow suggesting fast delivery", style: "Playful / Modern" },
    { description: "Abstract 'E' formed by intertwined shopping and heart icons", style: "Friendly / Approachable" },
    { description: "Simple box-with-ribbon mark — gift, unboxing, delight", style: "Minimalist / Premium" },
  ],
  devtools: [
    { description: "Angle bracket symbols forming a diamond — code meets creativity", style: "Developer / Code" },
    { description: "Terminal window with a blinking cursor in the brand color", style: "CLI / Terminal" },
    { description: "Abstract infinity loop made of connected nodes — integrations", style: "Modern / Connected" },
  ],
  climate: [
    { description: "Leaf encased in a circular refresh arrow — sustainability cycle", style: "Organic / Green" },
    { description: "Abstract globe with growing sprout — planet-first design", style: "Global / Natural" },
    { description: "Three overlapping leaves forming a gear — nature meets industry", style: "Modern / Eco" },
  ],
  edtech: [
    { description: "Open book with pages transforming into graduation cap", style: "Classic / Learning" },
    { description: "Abstract lightbulb with book-strip lines — ideas from knowledge", style: "Creative / Bright" },
    { description: "Interlocking 'E' and graduation cap in a shield shape", style: "Trust / Academic" },
  ],
  gaming: [
    { description: "Controller cross-pad reimagined as a star — play meets purpose", style: "Playful / Retro" },
    { description: "Abstract joystick with neon trail lines — motion and energy", style: "Neon / Cyberpunk" },
    { description: "Geometric dragon eye — focus, competition, victory", style: "Bold / Esports" },
  ],
  creator: [
    { description: "Sparkle wand merged with a play button — creation that performs", style: "Magical / Playful" },
    { description: "Abstract camera aperture with radiating content nodes", style: "Modern / Creator" },
    { description: "Stylized megaphone with sound waves — amplified voice", style: "Bold / Loud" },
  ],
  marketplace: [
    { description: "Two arrows circling each other — supply meets demand", style: "Dynamic / Balance" },
    { description: "Abstract scale with interconnected nodes on each side", style: "Fair / Connected" },
    { description: "Bridge shape with people icons — connecting communities", style: "Community / Bridge" },
  ],
  hardware: [
    { description: "Circuit-board pattern in the shape of a gear — hardware meets software", style: "Industrial / Tech" },
    { description: "Shield with lightning bolt — durability and power", style: "Robust / Strong" },
    { description: "Abstract chip/processor with radiating pin lines", style: "Modern / Engineering" },
  ],
  services: [
    { description: "Handshake integrated into a circular network — relationship meets reach", style: "Professional / Trust" },
    { description: "Abstract 'S' formed by connecting nodes in a constellation", style: "Modern / Network" },
    { description: "Building block columns with a rising arrow — structured growth", style: "Corporate / Stable" },
  ],
  saas: [
    { description: "Geometric letter mark with circuit-board lines representing neural networks", style: "Minimalist / Tech" },
    { description: "Abstract cloud node with connecting dots — SaaS connectivity", style: "Cloud / Modern" },
    { description: "Interlocking hexagons forming the first letter — modular and scalable", style: "Modern / Geometric" },
  ],
};

/* ─── Industry Profiles ─── */

const industryProfiles = {
  ai: {
    tagline: (_idea: string) => {
      const taglines = [
        "Ship AI models in days, not months",
        "Production ML without the PhD",
        "AI infrastructure that just works",
        "From prototype to production fast",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "Legacy AI infrastructure is bloated, expensive, and requires PhD-level expertise to manage.",
    solutionMeta: "A streamlined AI platform that delivers production-ready models in days, not months, without the enterprise overhead.",
    competitors: [
      { name: "Hugging Face", strength: "Massive open-source model library, strong community", weakness: "Not enterprise-ready, no managed infrastructure", opportunity: "Enterprise layer on top of open models" },
      { name: "Replicate", strength: "Easy model deployment, good developer experience", weakness: "Limited to inference, no training/customization", opportunity: "Full lifecycle ML platform" },
      { name: "Modal", strength: "Serverless GPU compute, fast scaling", weakness: "Infrastructure-only, no model management", opportunity: "End-to-end ML platform with model registry" },
      { name: "Anyscale", strength: "Ray-based distributed computing, enterprise-grade", weakness: "Complex setup, requires ML expertise", opportunity: "Simplified ML infrastructure for non-experts" },
    ],
    icpTitle: "VP of AI / ML Engineering",
    icpRole: "Technical decision-maker at a mid-market company",
    icpCompanySize: "50-500 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Technical leader responsible for deploying AI at scale, frustrated by cloud vendor lock-in and unpredictable GPU costs."
        : "Individual developer or data scientist experimenting with AI tools who needs fast prototyping without infrastructure headaches.",
    painPoints: [
      "Current AI infrastructure costs are unpredictable and ballooning",
      "MLOps toolchain requires too many disparate tools to manage",
      "Sourcing and retaining specialist ML talent is nearly impossible",
      "Compliance and governance for AI models is immature",
    ],
    goals: [
      "Reduce AI infrastructure costs by 50%",
      "Deploy new AI features in days, not months",
      "Maintain SOC 2 and GDPR compliance",
      "Scale from pilot to production seamlessly",
    ],
    objections: [
      "\"We already have a data science team\"",
      "\"Migrating would be too disruptive\"",
      "\"How secure is your platform?\"",
      "\"We need custom integrations\"",
    ],
    brandMission: "To make enterprise AI infrastructure as accessible as Stripe made payments.",
    brandValues: ["Simplicity over complexity", "Transparency in pricing", "Developer-first experience", "Enterprise-grade reliability"],
    brandTone: ["Confident but not arrogant", "Technical but accessible", "Ambitious and visionary", "Human-centered"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Clean landing page with good value proposition, but lacks social proof and detailed feature breakdown.",
    websiteStrengths: ["Clear headline explaining the product", "Modern, professional design", "Good mobile responsiveness"],
    websiteImprovements: ["Add customer testimonials and case studies", "Include pricing page", "Add more technical documentation", "Improve SEO meta tags"],
    websiteRecommendations: [
      "Add a clear CTA above the fold — 'Get Started' or 'Book a Demo'",
      "Include at least 3 customer logos or testimonials for social proof",
      "Add a product demo video or interactive walkthrough",
      "Implement live chat or a demo booking widget",
    ],
    icpRecommendations: [
      "Create case studies specifically targeting VPs of Engineering at companies with 50-500 employees",
      "Develop a comparison page vs. AWS SageMaker highlighting cost savings and ease of use",
      "Offer a free SOC 2 readiness assessment to address security objections early",
    ],
    insights: [
      { title: "Market Timing", description: "Enterprise AI infrastructure is projected to grow 40% YoY. Your positioning is well-aligned with market demand.", type: "positive" as const },
      { title: "Growth Opportunity", description: "Consider targeting FinTech vertical first — they have the highest willingness to pay for AI infrastructure.", type: "opportunity" as const },
      { title: "Revenue Alert", description: "Your burn rate suggests you have limited runway. Recommend focusing on paid pilots in Q2.", type: "warning" as const },
      { title: "Team Gap", description: "Startups at your stage typically succeed with at least one technical co-founder. Consider expanding your team.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Core AI inference engine prototype", description: "Basic model serving API with REST endpoints" },
          { title: "Training data pipeline infrastructure", description: "Automated data ingestion and labeling workflow" },
          { title: "Preview deployment for 10 beta users", description: "Limited access tester onboarding program" },
        ];
      if (stage === "seed")
        return [
          { title: "Multi-model orchestration layer", description: "Route requests to best-fit model dynamically" },
          { title: "Usage-based billing integration", description: "Real-time metering and invoicing system" },
          { title: "SOC 2 Type I compliance audit", description: "Security controls documentation and review" },
        ];
      return [
        { title: "Global edge deployment network", description: "Deploy models to 15+ regions with sub-50ms latency" },
        { title: "Custom model fine-tuning studio", description: "Let customers train on their own data" },
        { title: "Enterprise SSO & RBAC", description: "SAML/OIDC + role-based access control" },
      ];
    },
    roastVerdict: "Strong technical moat, but you're competing against every cloud provider's AI division. Your differentiation lives in the developer experience, not the models themselves.",
    roastRisks: ["Hyperscalers (AWS, GCP, Azure) will bundle AI services for free", "Open-source model quality is improving faster than proprietary SaaS", "Enterprise sales cycles are 6-12 months — your burn rate may not sustain that"],
    roastRecommendations: ["Open-source a core component to build community trust", "Publish benchmark comparisons against cloud AI services", "Target a single vertical (e.g., FinTech AI) before going horizontal"],
    roastItems: [
      { category: "Value Proposition", rating: 6, feedback: "\"Enterprise AI infrastructure\" is overused. Your headline doesn't differentiate you from 50 other startups. Be specific about WHO you help and HOW much you save them.", severity: "high" as const },
      { category: "Website UX", rating: 5, feedback: "Your hero section has a slow load time. You're losing visitors before they see your product. Also, no demo video?", severity: "high" as const },
      { category: "Target Market", rating: 7, feedback: "\"Mid-market\" is too broad. Are you targeting FinTech? HealthTech? E-commerce? Pick one vertical to dominate first.", severity: "medium" as const },
      { category: "Go-to-Market", rating: 4, feedback: "Talk to 50 potential customers BEFORE spending a dollar on marketing. Your ICP is a guess, not data.", severity: "high" as const },
      { category: "Pricing", rating: 5, feedback: "No pricing page = no trust. Even \"Starting at $X\" is better than nothing.", severity: "medium" as const },
      { category: "Product Demo", rating: 3, feedback: "Your product tour takes too many clicks to get to the core value. Users should understand what you do in under 5 seconds.", severity: "high" as const },
    ],
  },
  fintech: {
    tagline: (_idea: string) => {
      const taglines = [
        "Compliance without the chaos",
        "Financial infrastructure that scales",
        "Banking tech for the modern era",
        "Launch fintech products in weeks",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "Legacy financial systems are built on 40-year-old mainframes that cost millions to maintain and take years to update.",
    solutionMeta: "A modern, API-first financial platform that lets you launch, scale, and comply in weeks instead of quarters.",
    competitors: [
      { name: "Stripe", strength: "Best-in-class developer experience, global payments", weakness: "High fees for SMBs, limited lending/credit products", opportunity: "Vertical-specific FinTech (healthcare, real estate)" },
      { name: "Plaid", strength: "Banking data aggregation leader, wide integration", weakness: "Data read-only, no transaction processing", opportunity: "Full-stack financial infrastructure" },
      { name: "Unit", strength: "Banking-as-a-service, fast integration", weakness: "Limited to US market, no international expansion", opportunity: "Global BaaS platform with multi-currency" },
      { name: "Marqeta", strength: "Card issuing infrastructure, real-time controls", weakness: "Complex integration, enterprise-only pricing", opportunity: "Simplified card issuing for SMBs" },
    ],
    icpTitle: "CTO / Head of Engineering",
    icpRole: "Engineering leader at a financial institution",
    icpCompanySize: "200-2000 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Engineering leader at a financial institution frustrated by the gap between modern UX expectations and legacy core banking systems."
        : "SME or freelancer looking for better financial tools that don't require a business bank account.",
    painPoints: [
      "Core banking systems are too rigid to support modern product experiments",
      "Regulatory compliance (SOC 2, PCI-DSS) blocks every shipping decision",
      "Data silos between payment, lending, and accounting systems",
      "Customer onboarding still requires physical paperwork",
    ],
    goals: [
      "Launch new financial products in weeks, not quarters",
      "Reduce compliance overhead through automation",
      "Offer embedded financial services to your customers",
      "Achieve real-time transaction processing and settlement",
    ],
    objections: [
      "\"We're too regulated to adopt new technology\"",
      "\"How do you handle PCI-DSS compliance?\"",
      "\"Our existing banking partners lock us into legacy systems\"",
      "\"What happens if there's a security breach?\"",
    ],
    brandMission: "To make modern financial infrastructure accessible to every business, not just the Fortune 500.",
    brandValues: ["Security first", "Transparency by default", "Regulatory innovation", "Financial inclusion"],
    brandTone: ["Trustworthy but approachable", "Precise and clear", "Confident and reliable", "Customer-obsessed"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Professional landing page with strong trust signals, but lacks clear pricing and integration documentation.",
    websiteStrengths: ["Strong security and compliance messaging", "Professional, trustworthy design", "Clear value proposition"],
    websiteImprovements: ["Add detailed API documentation", "Include case studies from beta customers", "Show transparent pricing tiers", "Add a compliance whitepaper download"],
    websiteRecommendations: [
      "Add a 'Security & Compliance' section above the fold",
      "Include a live API playground for developers",
      "Showcase integration partners and banking network",
      "Add an ROI calculator for enterprise prospects",
    ],
    icpRecommendations: [
      "Develop a comparison page vs. legacy banking core providers",
      "Create a security whitepaper and publish SOC 2 reports publicly",
      "Build an integration marketplace for popular accounting platforms",
    ],
    insights: [
      { title: "Regulatory Advantage", description: "FinTech companies that embrace regulation as a moat outperform those that fight it. Your compliance-first approach is a strength.", type: "positive" as const },
      { title: "Embedded Finance", description: "The embedded finance market is projected to reach $230B. Consider offering your platform as a white-label solution.", type: "opportunity" as const },
      { title: "Capital Requirement", description: "FinTech requires 2-3x more capital than typical SaaS. Ensure your fundraising strategy accounts for regulatory deposits.", type: "warning" as const },
      { title: "Partnerships", description: "Partnering with a licensed bank can accelerate your go-to-market by 6-12 months vs. applying for your own license.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Core transaction engine MVP", description: "Handle payments, transfers, and ledger entries" },
          { title: "Compliance scaffolding", description: "KYC/AML checks and audit trail infrastructure" },
          { title: "Sandbox environment for testers", description: "Simulated financial data for developer preview" },
        ];
      if (stage === "seed")
        return [
          { title: "Multi-currency support", description: "Process transactions in 30+ currencies" },
          { title: "Recurring billing engine", description: "Subscription and installment payment scheduling" },
          { title: "Regulatory filing automation", description: "Auto-generate regulatory reports" },
        ];
      return [
        { title: "Real-time fraud detection", description: "ML-powered transaction monitoring" },
        { title: "Open banking API marketplace", description: "Third-party integration marketplace" },
        { title: "Global expansion: EU & APAC", description: "PSD2 compliance and regional licensing" },
      ];
    },
    roastVerdict: "FinTech is the most regulated, capital-intensive startup category. Your biggest risk isn't product — it's getting your first financial services license before running out of runway.",
    roastRisks: ["Regulatory approval timelines (6-18 months) exceed typical seed-stage runway", "Customer acquisition cost in FinTech is 3-5x SaaS averages due to trust barriers", "Incumbent banks are building their own digital products"],
    roastRecommendations: ["Partner with a licensed bank as a BaaS layer to bypass regulatory delays", "Target an underserved segment (e.g., gig workers, SMBs in emerging markets)", "Build in public with compliance documentation to accelerate trust"],
    roastItems: [
      { category: "Regulatory Strategy", rating: 5, feedback: "Your licensing timeline is optimistic. Most FinTechs underestimate regulatory approval by 6 months. Plan accordingly.", severity: "high" as const },
      { category: "Bank Partnerships", rating: 6, feedback: "Bank partnerships take 9-12 months to negotiate. Start conversations now, not after you launch.", severity: "high" as const },
      { category: "Target Market", rating: 7, feedback: "SMB banking is crowded. Consider a specific vertical like property management or healthcare payments.", severity: "medium" as const },
      { category: "Pricing", rating: 5, feedback: "Interchange fees and processing costs leave thin margins. Your unit economics need to be bulletproof.", severity: "medium" as const },
      { category: "Product Market Fit", rating: 6, feedback: "FinTech adoption requires trust that takes years to build. Have you considered starting with a free compliance tool?", severity: "medium" as const },
      { category: "Security Narrative", rating: 4, feedback: "Your security page is generic. Publish your penetration test results and SOC 2 report publicly.", severity: "high" as const },
    ],
  },
  healthtech: {
    tagline: (_idea: string) => {
      const taglines = [
        "Healthcare that heals the system",
        "Clinical tools that save time",
        "Patient care without the paperwork",
        "Healthcare tech built for doctors",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "Healthcare systems are fragmented, paper-heavy, and prioritize billing over patient outcomes.",
    solutionMeta: "A unified digital health platform that connects patients, providers, and payers in one seamless experience.",
    competitors: [
      { name: "Epic Systems", strength: "Dominant EMR provider, deep hospital integration", weakness: "Terrible UX, expensive, requires IT teams to operate", opportunity: "UX-first alternative for clinics" },
      { name: "DrChrono", strength: "iPad-native EMR, good mobile experience", weakness: "Limited to ambulatory care, no hospital features", opportunity: "Full-stack clinic management platform" },
      { name: "ZeOmega", strength: "Population health management, analytics", weakness: "Complex implementation, enterprise-only", opportunity: "Simplified analytics for small practices" },
      { name: "Health Catalyst", strength: "Data analytics platform, outcome tracking", weakness: "Requires massive data infrastructure", opportunity: "Lightweight analytics for SMB healthcare" },
    ],
    icpTitle: "Chief Medical Information Officer",
    icpRole: "Clinical technology decision-maker at a hospital system",
    icpCompanySize: "500-5000+ employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Hospital system executive responsible for digital transformation, drowning in legacy EMR systems and interoperability nightmares."
        : "Patient who manages multiple specialists, prescriptions, and insurance claims with no central coordination.",
    painPoints: ["EMR systems don't talk to each other — patient data is siloed", "HIPAA compliance makes every engineering change a legal review", "Telehealth adoption is stuck at 2019 infrastructure", "Billing and clinical data exist in parallel universes"],
    goals: ["Achieve true interoperability between EMR systems", "Reduce clinician burnout through better UX", "Improve patient outcomes with data-driven insights", "Meet meaningful use and MIPS requirements"],
    objections: ["\"We just invested $10M in Epic\"", "\"HIPAA compliance is too risky with third parties\"", "\"Our clinicians won't adopt another tool\"", "\"How do you integrate with our existing stack?\""],
    brandMission: "To make healthcare technology work for patients, clinicians, and administrators alike.",
    brandValues: ["Patient-first design", "Clinical accuracy", "Privacy by default", "Interoperability"],
    brandTone: ["Empathetic and caring", "Clinically precise", "Clear and educational", "Innovative but grounded"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Clean, professional website with strong clinical imagery, but lacks technical depth on integrations.",
    websiteStrengths: ["Trustworthy clinical design language", "Clear patient-first messaging", "Good accessibility compliance"],
    websiteImprovements: ["Add EMR integration documentation", "Include clinician testimonials", "Showcase regulatory compliance certifications", "Add a product demo video"],
    websiteRecommendations: [
      "Lead with interoperability — list supported EMRs prominently",
      "Add a 'Security & Compliance' section with HIPAA attestation",
      "Include case studies from pilot hospitals or clinics",
      "Offer a self-service sandbox for IT teams to test integrations",
    ],
    icpRecommendations: [
      "Build an EMR integration directory showing compatibility with Epic, Cerner, and Meditech",
      "Publish a HIPAA compliance whitepaper before the first sales call",
      "Create a clinician ROI calculator showing hours saved per week",
    ],
    insights: [
      { title: "Interoperability Mandate", description: "CMS interoperability rules are driving $5B+ in healthcare IT spending. Your timing aligns with regulatory tailwinds.", type: "positive" as const },
      { title: "Clinician Burnout", description: "86% of clinicians report burnout from administrative tools. A UX-first approach is a massive differentiator.", type: "opportunity" as const },
      { title: "Sales Cycle Reality", description: "Hospital procurement averages 12-18 months. Plan your runway accordingly and start with outpatient clinics.", type: "warning" as const },
      { title: "Integration First", description: "Build Epic and Cerner integrations before adding features. Without EMR integration, your product won't get evaluated.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Patient intake digitalization MVP", description: "Replace paper forms with tablet-based intake" },
          { title: "HIPAA-compliant data layer", description: "Encrypted storage and audit logging" },
          { title: "Provider dashboard prototype", description: "Single-pane view of patient schedule and history" },
        ];
      if (stage === "seed")
        return [
          { title: "Telehealth video integration", description: "HIPAA-compliant video consultations" },
          { title: "E-prescription engine", description: "Digital prescribing with pharmacy network integration" },
          { title: "Insurance eligibility verification", description: "Real-time benefits checking" },
        ];
      return [
        { title: "Interoperability with major EMRs", description: "Epic and Cerner API integration" },
        { title: "AI-assisted diagnosis support", description: "Clinical decision support tooling" },
        { title: "Value-based care analytics", description: "Outcome tracking and reporting suite" },
      ];
    },
    roastVerdict: "Healthcare is the hardest market to sell into. The buyer isn't the user, the sales cycle is 12-18 months, and one compliance misstep ends the company.",
    roastRisks: ["HIPAA compliance is expensive ($50K-$200K for initial audit)", "Hospital procurement cycles kill early-stage startups", "Clinical validation requires studies that take years"],
    roastRecommendations: ["Start with a B2B2C model: sell to clinics, not hospitals", "Build for a single specialty (e.g., dermatology) before generalizing", "Publish a security whitepaper on day one to shorten trust-building"],
    roastItems: [
      { category: "Compliance Readiness", rating: 4, feedback: "HIPAA BAAs alone take 3-6 months to negotiate with hospital legal teams. Start the paperwork before you have customers.", severity: "high" as const },
      { category: "Integration Strategy", rating: 5, feedback: "Without Epic integration, you're not sellable to hospitals. Build that first, even if it's a manual export feature.", severity: "high" as const },
      { category: "Target Market", rating: 6, feedback: "Starting with hospitals is a mistake. Target independent clinics and urgent care centers first — faster sales cycles.", severity: "medium" as const },
      { category: "Clinical Validation", rating: 5, feedback: "You need clinical evidence. Publish a pilot study with measurable outcomes before approaching enterprise buyers.", severity: "high" as const },
      { category: "UX for Clinicians", rating: 6, feedback: "Clinicians have 15-minute appointment slots. If your tool adds even one extra click, adoption will fail.", severity: "medium" as const },
      { category: "Pricing Model", rating: 5, feedback: "Hospitals hate per-seat pricing. Consider per-encounter or value-based pricing that aligns with outcomes.", severity: "medium" as const },
    ],
  },
  ecommerce: {
    tagline: (_idea: string) => {
      const taglines = [
        "Retail that reads the room",
        "Shopping experiences that convert",
        "E-commerce built to scale",
        "Your store, everywhere",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "E-commerce platforms are generic templates that don't adapt to unique product categories or customer segments.",
    solutionMeta: "An adaptive commerce platform that optimizes every touchpoint from discovery to delivery.",
    icpTitle: "Head of E-Commerce",
    icpRole: "E-commerce director at a mid-market retailer",
    icpCompanySize: "50-500 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "E-commerce director at a mid-market retailer struggling to differentiate against Amazon and Shopify-powered competitors."
        : "Independent seller or creator who needs a storefront that reflects their brand without coding.",
    painPoints: ["Shopify templates make every store look the same", "Inventory management across channels is a nightmare", "Customer acquisition costs have doubled in 3 years", "International shipping and duties are too complex"],
    goals: ["Increase average order value by 20%", "Reduce cart abandonment rate below 60%", "Launch international shipping capability", "Unify inventory across all sales channels"],
    objections: ["\"We're already on Shopify and it works fine\"", "\"Migrating our catalog would take months\"", "\"How do you handle PCI compliance for payments?\"", "\"Our team doesn't have technical resources for integration\""],
    brandMission: "To give every brand the tools to create shopping experiences that reflect their unique identity.",
    brandValues: ["Merchant-first", "Design excellence", "Performance obsession", "Global reach"],
    brandTone: ["Inspirational and aspirational", "Practical and helpful", "Modern and fresh", "Confident but humble"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Visually appealing storefront with strong product presentation, but needs better conversion optimization.",
    websiteStrengths: ["High-quality product imagery", "Clean, uncluttered layout", "Fast page load times"],
    websiteImprovements: ["Add customer reviews and social proof", "Optimize checkout flow (reduce steps)", "Add international shipping calculator", "Implement abandoned cart recovery"],
    websiteRecommendations: ["Add urgency signals (low stock, time-limited offers)", "Implement one-click checkout for returning customers", "Add a size guide or product comparison tool", "Showcase user-generated content and reviews"],
    icpRecommendations: [
      "Create a migration guide from Shopify that shows 30-min setup time",
      "Build a product feed integration with Google Shopping and TikTok Shop",
      "Offer a free 'conversion audit' with actionable recommendations",
    ],
    insights: [
      { title: "DTC Expansion", description: "Direct-to-consumer brands are growing 3x faster than traditional retail. Your platform is well-positioned for this shift.", type: "positive" as const },
      { title: "International Opportunity", description: "Cross-border e-commerce is growing 2x domestic. Adding multi-currency support could unlock 30%+ revenue growth.", type: "opportunity" as const },
      { title: "Cart Abandonment", description: "Average cart abandonment is 70%. A 10% improvement could double your conversion rate. Prioritize checkout optimization.", type: "warning" as const },
      { title: "Channel Expansion", description: "Integrate with TikTok Shop and Instagram Checkout to capture social commerce traffic before competitors do.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Core product catalog engine", description: "SKU management, variants, and inventory tracking" },
          { title: "Checkout flow MVP", description: "Single-page checkout with 3 payment gateways" },
          { title: "Seller onboarding experience", description: "Self-service store setup wizard" },
        ];
      if (stage === "seed")
        return [
          { title: "Multi-channel inventory sync", description: "Real-time sync across web, Amazon, and retail" },
          { title: "Dynamic pricing engine", description: "Rule-based pricing adjustments and promotions" },
          { title: "International shipping calculator", description: "Real-time duties, taxes, and shipping quotes" },
        ];
      return [
        { title: "AI-powered product recommendations", description: "Personalized shopping experiences" },
        { title: "Headless commerce API", description: "Let partners build custom storefronts" },
        { title: "Subscription and repeat-order engine", description: "Recurring revenue infrastructure" },
      ];
    },
    roastVerdict: "E-commerce is a margin game. You're competing against Shopify's $6B war chest and Amazon's logistics empire. Your only path is extreme vertical specialization.",
    roastRisks: ["Shopify App Store already has 8,000+ apps — discoverability is nil", "E-commerce profit margins are razor-thin (1-5%)", "Customer acquisition costs are at an all-time high"],
    roastRecommendations: ["Focus on a single underserved category (e.g., luxury resale, pet supplies)", "Offer logistics as a differentiator, not just software", "Build partnerships with niche manufacturers"],
    roastItems: [
      { category: "Competitive Positioning", rating: 5, feedback: "Shopify is the 800lb gorilla. You need a clear 'why not Shopify' message on your homepage above the fold.", severity: "high" as const },
      { category: "Merchant Economics", rating: 4, feedback: "E-commerce margins are 1-5%. If your platform fee eats into that, merchants will leave. Make your pricing align with their success.", severity: "high" as const },
      { category: "Acquisition Strategy", rating: 6, feedback: "Content marketing works for e-commerce tools. Publish conversion optimization guides to attract merchants.", severity: "medium" as const },
      { category: "Product Differentiation", rating: 5, feedback: "Your features look similar to Shopify Plus. What's the one thing only you can do? Lead with that.", severity: "high" as const },
      { category: "Mobile Experience", rating: 6, feedback: "75% of e-commerce traffic is mobile. If your mobile checkout isn't flawless, you're losing 3 in 4 visitors.", severity: "medium" as const },
      { category: "Payment Processing", rating: 5, feedback: "Payment processing alone can be a business. Are you offering competitive rates or just passing through Stripe costs?", severity: "medium" as const },
    ],
  },
  devtools: {
    tagline: (_idea: string) => {
      const taglines = [
        "Code that ships itself",
        "Dev tools that feel magical",
        "Build faster, break less",
        "Developer experience perfected",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "The modern dev toolchain has exploded in complexity — teams manage 15+ tools just to ship one feature.",
    solutionMeta: "A unified developer platform that consolidates the toolchain into one seamless workflow.",
    icpTitle: "VP of Engineering",
    icpRole: "Engineering leader at a fast-growing tech company",
    icpCompanySize: "20-200 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Engineering leader looking to reduce toolchain complexity and improve developer velocity across multiple teams."
        : "Independent developer wanting professional-grade tooling without enterprise licensing overhead.",
    painPoints: ["Team spends 30% of sprint time context-switching between tools", "Developer onboarding takes 2 weeks due to toolchain complexity", "Security and compliance scanning is an afterthought", "Metrics are spread across 5 dashboards"],
    goals: ["Reduce developer onboarding time to 1 day", "Consolidate from 15 tools to 3", "Achieve 99.9% CI/CD reliability", "Ship features 2x faster"],
    objections: ["\"We already have a stack we're happy with\"", "\"Migrating our CI/CD pipeline is too risky\"", "\"How does this compare to GitHub Actions?\"", "\"We don't want vendor lock-in\""],
    brandMission: "To make every developer 10x more productive by eliminating toolchain friction.",
    brandValues: ["Developer experience first", "Open by default", "Performance is a feature", "Simplicity at scale"],
    brandTone: ["Technical and precise", "Clear and direct", "Developer-relatable", "Humble but excellent"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Developer-friendly landing page with clear value prop, but lacks API documentation and playground.",
    websiteStrengths: ["Clean developer-first design", "Strong performance benchmarks", "Good onboarding flow"],
    websiteImprovements: ["Add interactive API documentation", "Include migration guides from popular tools", "Showcase open-source contributions", "Add a live sandbox/demo environment"],
    websiteRecommendations: [
      "Add a 'Quick Start' guide that shows setup in under 5 minutes",
      "Include a comparison page vs. incumbent tools",
      "Add a CLI demo with copy-paste commands",
      "Showcase GitHub star count and community metrics",
    ],
    icpRecommendations: [
      "Publish migration guides from GitHub Actions, Jenkins, and CircleCI",
      "Create a public roadmap that developers can vote on",
      "Build a community Discord before launching paid tiers",
    ],
    insights: [
      { title: "Developer Loyalty", description: "Dev tools have the highest NPS of any software category. Build community love early — it's your best moat.", type: "positive" as const },
      { title: "PLG Opportunity", description: "Bottom-up adoption through individual developers is the fastest path to enterprise deals. Invest in self-serve.", type: "opportunity" as const },
      { title: "Open Source Risk", description: "Open-source alternatives are 'good enough' for most teams. Your paid features need to be dramatically better.", type: "warning" as const },
      { title: "Community Building", description: "Start a developer blog and publish engineering content. DevTools companies that educate outperform those that just sell.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Core pipeline CI/CD engine", description: "Build, test, deploy in one command" },
          { title: "Plugin/extension SDK", description: "Let the community extend the platform" },
          { title: "CLI tool with 10 core commands", description: "Developer-first terminal experience" },
        ];
      if (stage === "seed")
        return [
          { title: "Team collaboration features", description: "Shared workspaces, comments, and review queues" },
          { title: "Security scanning integration", description: "Automated vulnerability detection in pipelines" },
          { title: "Analytics dashboard", description: "Deployment frequency, lead time, and MTTR tracking" },
        ];
      return [
        { title: "Enterprise SSO & audit logging", description: "SAML, SCIM, and compliance reporting" },
        { title: "Marketplace for community plugins", description: "Third-party extension ecosystem" },
        { title: "On-premise deployment option", description: "Air-gapped installation for regulated industries" },
      ];
    },
    roastVerdict: "Developer tools are loved by users but hated by procurement. You'll get passionate adoption from individual devs but struggle to close enterprise deals until you have SSO and compliance reports.",
    roastRisks: ["Open-source alternatives are free and often 'good enough'", "Enterprise sales cycles are long; devs can't authorize purchases over $50/mo", "Toolchain fatigue means teams are reluctant to add another tool"],
    roastRecommendations: ["Open-source a core component to drive adoption", "Offer a generous free tier that hooks individual developers", "Publish engineering blogs and performance benchmarks"],
    roastItems: [
      { category: "Monetization Strategy", rating: 5, feedback: "Developers will use your free tier forever. Your paid tier needs features procurement cares about (SSO, audit, RBAC).", severity: "high" as const },
      { category: "Open Source Threat", rating: 4, feedback: "If your tool can be replaced by a 50-line bash script, it will be. Build features that can't be replicated.", severity: "high" as const },
      { category: "Developer Experience", rating: 7, feedback: "Your CLI is solid, but the web dashboard feels slow. Devs won't wait 2 seconds for a dashboard to load.", severity: "medium" as const },
      { category: "Documentation", rating: 6, feedback: "DevTools live or die by their docs. Your getting-started guide should be 3 steps, not 3 pages.", severity: "medium" as const },
      { category: "Integration Depth", rating: 5, feedback: "15+ tools is a lot. Focus on perfecting the top 5 integrations before expanding horizontally.", severity: "medium" as const },
      { category: "Pricing Transparency", rating: 5, feedback: "Hidden pricing is a red flag for developers. Put your pricing on the website, even if it's 'Free for teams up to 5'.", severity: "high" as const },
    ],
  },
  climate: {
    tagline: (_idea: string) => {
      const taglines = [
        "Climate tech that pays for itself",
        "Green solutions, real returns",
        "Sustainability without sacrifice",
        "Clean tech for the bottom line",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "Climate tech solutions exist but are fragmented, expensive to deploy, and don't integrate with existing industrial infrastructure.",
    solutionMeta: "An integrated climate platform that makes sustainability measurable, manageable, and monetizable.",
    icpTitle: "Chief Sustainability Officer",
    icpRole: "Sustainability executive at a mid-to-large enterprise",
    icpCompanySize: "500-5000 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Sustainability executive under pressure to meet net-zero targets with limited tools and budget."
        : "Environmentally conscious consumer looking to reduce their carbon footprint through better technology.",
    painPoints: ["Carbon accounting is still done in spreadsheets", "ESG reporting frameworks are inconsistent across jurisdictions", "Supply chain emissions data is nearly impossible to collect", "Green technology ROI is unclear to CFOs"],
    goals: ["Automate 90% of carbon data collection", "Achieve ESG reporting compliance in EU and US", "Identify $1M+ in energy cost savings", "Get supply chain suppliers to report emissions"],
    objections: ["\"Sustainability is a cost center, not a revenue driver\"", "\"We already have consultants doing our ESG reporting\"", "\"How accurate is your carbon data?\"", "\"We don't have budget for another SaaS tool\""],
    brandMission: "To make sustainability the default operating system for every business.",
    brandValues: ["Radical transparency", "Scientific rigor", "Systems thinking", "Climate justice"],
    brandTone: ["Urgent but hopeful", "Data-driven and credible", "Clear and actionable", "Globally minded"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Mission-driven website with strong visual storytelling, but needs more technical depth on data methodology.",
    websiteStrengths: ["Compelling mission-driven narrative", "Beautiful environmental imagery", "Clear reporting framework explanations"],
    websiteImprovements: ["Add methodology whitepapers", "Include customer case studies", "Showcase data accuracy benchmarks", "Add integration directory for ERP systems"],
    websiteRecommendations: [
      "Lead with ROI — show how sustainability saves money",
      "Add a compliance calendar showing reporting deadlines by region",
      "Publish a carbon accounting methodology guide",
      "Include a self-service emissions estimator tool",
    ],
    icpRecommendations: [
      "Create an ESG compliance checklist tailored to the user's industry",
      "Publish case studies showing quantifiable ROI from sustainability",
      "Build pre-built integrations with SAP, Oracle, and Workday",
    ],
    insights: [
      { title: "Regulatory Tailwind", description: "EU CSRD and SEC climate disclosure rules are creating mandatory reporting for 50,000+ companies. Your market just got bigger by law.", type: "positive" as const },
      { title: "Data Network Effects", description: "Every customer improves your emissions data model. Build a data consortium to create switching costs.", type: "opportunity" as const },
      { title: "Budget Constraints", description: "Sustainability budgets are often the first cut during downturns. Prove hard dollar savings, not just ESG impact.", type: "warning" as const },
      { title: "Partnership Strategy", description: "Partner with carbon credit marketplaces and renewable energy providers to offer an end-to-end sustainability stack.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Carbon tracking engine MVP", description: "Scope 1, 2, and 3 emissions calculator" },
          { title: "Data integration API", description: "Connect to utility providers and ERP systems" },
          { title: "Reporting dashboard", description: "Generate ESG reports in major frameworks" },
        ];
      if (stage === "seed")
        return [
          { title: "Supply chain data network", description: "Automated supplier emissions data collection" },
          { title: "Offset marketplace integration", description: "Purchase verified carbon credits" },
          { title: "Regulatory compliance engine", description: "Auto-generate CDP, TCFD, and SEC filings" },
        ];
      return [
        { title: "AI-powered reduction recommendations", description: "Identify highest-ROI decarbonization levers" },
        { title: "Green procurement marketplace", description: "Vetted sustainable suppliers and materials" },
        { title: "Real-time environmental monitoring", description: "IoT integration for continuous tracking" },
      ];
    },
    roastVerdict: "Climate tech has the tailwinds but faces the longest sales cycles of any vertical. Your buyers have budgets but no authority, and authority figures have no budgets.",
    roastRisks: ["ESG reporting is mandatory for public companies but discretionary for private", "Carbon credit markets are immature and reputationally risky", "Your own operations may have significant carbon footprint"],
    roastRecommendations: ["Target regulated industries first (EU, California) where reporting is mandatory", "Publish your own carbon footprint transparently", "Integrate with existing ERP systems rather than replacing them"],
    roastItems: [
      { category: "Buyer Persona", rating: 5, feedback: "CSOs have influence but rarely budget authority. You need to also sell to CFOs who control P&L.", severity: "high" as const },
      { category: "Data Accuracy", rating: 6, feedback: "Carbon data is inherently estimated. Be transparent about your methodology and margin of error.", severity: "medium" as const },
      { category: "Competitive Landscape", rating: 5, feedback: "Watershed, Persefoni, and Salesforce Net Zero Cloud all exist. What's your unfair advantage?", severity: "high" as const },
      { category: "Regulatory Coverage", rating: 6, feedback: "You cover EU CSRD but what about SEC climate rules and California SB 253? Coverage breadth is a competitive moat.", severity: "medium" as const },
      { category: "Integration Depth", rating: 5, feedback: "Manual data entry kills adoption. You need automated ingestion from utility APIs and ERP systems.", severity: "high" as const },
      { category: "Monetization", rating: 5, feedback: "ESG budgets are small. Consider per-report pricing rather than annual subscriptions to lower entry barriers.", severity: "medium" as const },
    ],
  },
  edtech: {
    tagline: (_idea: string) => {
      const taglines = [
        "Learning that adapts to you",
        "Teaching tools that actually work",
        "Education built for the future",
        "Students learn faster, teachers teach better",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "Education is still one-size-fits-all, delivered through PDFs and video lectures.",
    solutionMeta: "An adaptive learning platform that personalizes content, pace, and assessment for every student.",
    icpTitle: "Director of Curriculum & Instruction",
    icpRole: "Academic administrator at a K-12 or higher-ed institution",
    icpCompanySize: "100-1000+ faculty",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Academic administrator looking to modernize curriculum delivery while meeting accreditation standards."
        : "Self-directed learner who wants structured, high-quality education outside traditional institutions.",
    painPoints: ["Student engagement drops 60% after the first week of any online course", "Assessment data is retrospective, not real-time", "Personalizing content for 30+ students per class is impossible manually", "Accreditation requirements block rapid curriculum updates"],
    goals: ["Increase student course completion rates by 40%", "Provide real-time intervention for at-risk students", "Reduce instructor grading time by 50%", "Achieve accreditation for digital-first programs"],
    objections: ["\"We have a 5-year contract with Blackboard\"", "\"Faculty won't adopt new technology mid-semester\"", "\"How do you ensure academic integrity?\"", "\"Our IT department blocks third-party integrations\""],
    brandMission: "To create a world where every student gets an education tailored to how they learn best.",
    brandValues: ["Learner agency", "Equity and access", "Evidence-based design", "Continuous improvement"],
    brandTone: ["Inspiring and hopeful", "Research-backed and credible", "Clear and student-friendly", "Empowering and supportive"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Clean educational website with strong learning outcomes focus, but needs more research validation.",
    websiteStrengths: ["Clear learning outcomes messaging", "Professional academic design", "Good accessibility features"],
    websiteImprovements: ["Add efficacy research and studies", "Include instructor testimonials", "Showcase student success stories", "Add LMS integration documentation"],
    websiteRecommendations: [
      "Publish efficacy studies showing measurable learning improvements",
      "Add a 'Try it as a student' demo experience",
      "Include integration guides for Canvas, Blackboard, and Moodle",
      "Showcase accreditation and standards alignment",
    ],
    icpRecommendations: [
      "Create an LMS integration comparison guide highlighting setup speed",
      "Publish a 'future of assessment' whitepaper for academic decision-makers",
      "Offer a free pilot program for 1-2 classrooms with full support",
    ],
    insights: [
      { title: "Post-COVID Shift", description: "Hybrid learning is permanent. 70% of students prefer some online component. Your platform addresses this structural shift.", type: "positive" as const },
      { title: "Assessment Innovation", description: "Traditional grading is being replaced by competency-based assessment. Build for this future first.", type: "opportunity" as const },
      { title: "Budget Cycles", description: "School budgets are locked 12-18 months in advance. Q1 is too late to start selling for the next academic year.", type: "warning" as const },
      { title: "Faculty Adoption", description: "Teachers won't adopt tools that add to their workload. Every feature must save them time, not create more work.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Adaptive content engine", description: "Content fragments that reassemble per learner" },
          { title: "Assessment & analytics MVP", description: "Real-time comprehension scoring" },
          { title: "Instructor dashboard", description: "Class-level engagement and performance metrics" },
        ];
      if (stage === "seed")
        return [
          { title: "Course authoring tools", description: "Drag-and-drop curriculum builder for instructors" },
          { title: "Peer learning features", description: "Discussion boards, group projects, and reviews" },
          { title: "LMS integration (Canvas, Blackboard)", description: "Single sign-on and gradebook sync" },
        ];
      return [
        { title: "AI tutoring assistant", description: "Natural language Q&A for students 24/7" },
        { title: "Credentialing & certification", description: "Verified digital credentials and badges" },
        { title: "Enterprise learning analytics", description: "Workforce upskilling and ROI tracking" },
      ];
    },
    roastVerdict: "EdTech buyers (schools, universities) have 9-month procurement cycles and zero budget for unproven tools. Your product may be great, but the sales motion is broken.",
    roastRisks: ["School budgets are locked 12-18 months in advance", "Teachers are overworked and resist new tools", "Free alternatives (Khan Academy, Coursera) set the price expectation at $0"],
    roastRecommendations: ["Sell to corporate L&D departments first — they have faster budgets", "Prove efficacy with a measurable outcome study before targeting schools", "Integrate with existing LMS rather than replacing it"],
    roastItems: [
      { category: "Sales Motion", rating: 4, feedback: "School districts take 9-12 months to close. Sell to corporate L&D while building school pipeline.", severity: "high" as const },
      { category: "Efficacy Data", rating: 5, feedback: "Without published efficacy studies, you're selling on hope. Run an RCT with a partner school.", severity: "high" as const },
      { category: "Integration Dependence", rating: 6, feedback: "If you don't integrate with Canvas or Blackboard, you won't get evaluated. Build these first.", severity: "medium" as const },
      { category: "Teacher Workload", rating: 5, feedback: "If your tool adds 5 minutes to a teacher's day, adoption will be zero. Every feature must save time.", severity: "high" as const },
      { category: "Pricing Model", rating: 5, feedback: "Per-student pricing caps your upside in K-12. Consider per-school or district-wide licensing.", severity: "medium" as const },
      { category: "Accessibility", rating: 6, feedback: "WCAG compliance is non-negotiable in education. If your platform isn't accessible, it's legally risky for schools to buy.", severity: "medium" as const },
    ],
  },
  gaming: {
    tagline: (_idea: string) => {
      const taglines = [
        "Games that make you think",
        "Play with purpose",
        "Gaming meets meaning",
        "Entertainment that matters",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "Game development is increasingly centralized around a few engines and platforms.",
    solutionMeta: "A platform that democratizes game development with AI-powered tools and cross-platform deployment.",
    icpTitle: "Indie Game Studio Lead",
    icpRole: "Small-to-mid game studio head",
    icpCompanySize: "2-20 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Small-to-mid game studio head looking to reduce development costs and accelerate time-to-market."
        : "Solo game developer wanting to turn their passion into a revenue-generating game.",
    painPoints: ["Unity and Unreal are overkill for indie projects", "Cross-platform deployment requires separate codebases", "User acquisition for indie games is lottery-like", "Monetization strategies are guesswork without data"],
    goals: ["Ship a game in under 6 months", "Launch on 3 platforms simultaneously", "Build a community of 10K wishlists before launch", "Generate $10K MRR from game revenue"],
    objections: ["\"We already have a workflow that works\"", "\"AI-generated content feels low quality\"", "\"How does this handle multiplayer?\"", "\"We don't want to share revenue with a platform\""],
    brandMission: "To enable anyone with a creative vision to build and ship a game.",
    brandValues: ["Creative freedom", "Technical accessibility", "Community-driven", "Indie-first"],
    brandTone: ["Passionate and creative", "Gamer-authentic", "Approachable and supportive", "Bold and ambitious"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Visually engaging gaming site with strong community feel, but needs more technical documentation.",
    websiteStrengths: ["Exciting visual design language", "Clear indie-game focus", "Strong community call-to-action"],
    websiteImprovements: ["Add engine performance benchmarks", "Include game showcase gallery", "Add technical documentation", "Show revenue share and pricing clearly"],
    websiteRecommendations: [
      "Add a 'Built with [Platform]' game showcase gallery",
      "Include a performance comparison vs. Unity/Unreal",
      "Create a 'Game in 5 minutes' demo video",
      "Add a developer Discord community link prominently",
    ],
    icpRecommendations: [
      "Create migration guides from Unity and Unreal with time-saving metrics",
      "Publish a 'How to Launch on Steam' guide for indie developers",
      "Offer a revenue-share-free tier for games under $10K revenue",
    ],
    insights: [
      { title: "Indie Golden Age", description: "Steam released 14,000+ games in 2024, 80% from indie developers. The indie market is booming.", type: "positive" as const },
      { title: "Platform Opportunity", description: "Netflix Gaming and Apple Arcade are paying for exclusive indie titles. Help devs get distribution deals.", type: "opportunity" as const },
      { title: "Discovery Crisis", description: "Steam has 14K+ game releases per year. Being found is harder than being built. Build marketing tools.", type: "warning" as const },
      { title: "Community First", description: "Games that launch with 10K+ Steam wishlists have 3x higher day-1 revenue. Build wishlist-gathering tools.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Core game engine prototype", description: "2D/3D rendering with physics simulation" },
          { title: "Asset marketplace MVP", description: "Curated assets, sounds, and templates" },
          { title: "Single-platform build pipeline", description: "Export to Steam or Itch.io" },
        ];
      if (stage === "seed")
        return [
          { title: "Multi-platform build system", description: "One build → Windows, Mac, Linux, mobile" },
          { title: "Multiplayer networking layer", description: "Real-time sync for up to 32 players" },
          { title: "Analytics & monetization SDK", description: "In-app purchases and ad optimization" },
        ];
      return [
        { title: "AI-powered game design assistant", description: "Procedural content generation and balancing" },
        { title: "Community publishing platform", description: "Let users create and sell game mods" },
        { title: "Esports tournament infrastructure", description: "Matchmaking, rankings, and spectator mode" },
      ];
    },
    roastVerdict: "Gaming is entertainment, not utility. Your competitors aren't other tools — they're TikTok, Netflix, and sleep. Retention is everything.",
    roastRisks: ["Steam takes 30% of every sale and controls discovery", "Mobile game UA costs are $4-7 per install", "Game development timelines regularly slip 2-3x"],
    roastRecommendations: ["Launch on Steam Early Access to validate before full investment", "Build a community on Discord before writing code", "Design for streaming — make your game entertaining to watch"],
    roastItems: [
      { category: "Competitive Positioning", rating: 5, feedback: "Unity and Unreal have 15+ years of community content. You need 10x better DX to overcome the content gap.", severity: "high" as const },
      { category: "Revenue Model", rating: 5, feedback: "Indie developers are cash-poor. A revenue share model will scare them off. Free tier with optional paid features.", severity: "high" as const },
      { category: "Platform Lock-in", rating: 6, feedback: "Developers fear building on a platform that might shutdown. Open-source your core engine to build trust.", severity: "medium" as const },
      { category: "Developer Tools UX", rating: 6, feedback: "Game dev tools are notoriously complex. Your editor needs to feel like Figma, not Visual Studio.", severity: "medium" as const },
      { category: "Asset Quality", rating: 5, feedback: "Free/generic assets make games look cheap. Partner with professional artists to offer premium asset packs.", severity: "medium" as const },
      { category: "Performance", rating: 6, feedback: "Gamers notice frame drops instantly. Your engine needs to deliver 60fps on mid-range hardware out of the box.", severity: "medium" as const },
    ],
  },
  creator: {
    tagline: (_idea: string) => {
      const taglines = [
        "Create more, manage less",
        "Creator tools that scale",
        "Your content, your empire",
        "Build your audience, own your income",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "Creators rely on 8+ platforms, 15+ tools, and manual workflows to run what is essentially a media business.",
    solutionMeta: "An all-in-one creator operating system that handles content production, distribution, monetization, and analytics.",
    icpTitle: "Full-Time Creator",
    icpRole: "Solo creator or small team managing multiple platforms",
    icpCompanySize: "1-5 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2c")
        ? "Solo creator managing multiple platforms (YouTube, TikTok, Instagram, newsletter) with spreadsheets and caffeine."
        : "Aspiring creator building an audience while working a day job, needing tools that save time and optimize growth.",
    painPoints: ["Managing 5+ platforms means 5x the manual work per piece of content", "Sponsorship management is still done via email", "Analytics are scattered across every platform's native dashboard", "Invoice and payment tracking across 10+ revenue streams is chaotic"],
    goals: ["Reduce content production time by 50%", "Grow audience across 3 platforms simultaneously", "Land 5 paying brand sponsorships per month", "Achieve $10K/month creator income"],
    objections: ["\"I already have a workflow that works for me\"", "\"Another subscription? I already pay for 10 tools\"", "\"Will this actually save me time or is it more setup?\"", "\"How does this compare to Buffer/Hootsuite?\""],
    brandMission: "To give creators the infrastructure of a media company without the overhead.",
    brandValues: ["Creator-first economy", "Platform independence", "Time as currency", "Authenticity at scale"],
    brandTone: ["Energetic and relatable", "Practical and honest", "Supportive and encouraging", "Direct and no-BS"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Energetic creator-focused landing page with clear pain-point messaging, but needs social proof.",
    websiteStrengths: ["Relatable creator pain-point messaging", "Clean, modern design", "Clear feature breakdown"],
    websiteImprovements: ["Add creator testimonials and case studies", "Include platform-specific feature comparisons", "Add a 'time saved' calculator", "Showcase revenue growth stories"],
    websiteRecommendations: [
      "Feature real creators using the platform with their stats",
      "Add a time-saving calculator ('How many hours do you spend on admin?')",
      "Include platform-specific migration guides (from Buffer, Later, etc.)",
      "Add a 'free forever' tier with genuinely useful features",
    ],
    icpRecommendations: [
      "Create platform-specific guides (YouTube automation, TikTok scheduling)",
      "Publish a 'Creator Income Report' benchmarking typical revenue streams",
      "Offer a free migration concierge service for power users",
    ],
    insights: [
      { title: "Creator Economy Growth", description: "The creator economy is projected to reach $500B by 2027. Professional creators need professional tools.", type: "positive" as const },
      { title: "Platform Diversification", description: "Creators with 3+ income streams earn 4x more. Your multi-platform focus helps them diversify.", type: "opportunity" as const },
      { title: "Churn Risk", description: "Creators churn at 5-8% monthly due to inconsistent income. A free tier is essential for retention.", type: "warning" as const },
      { title: "AI Integration", description: "AI content repurposing (long-form → clips → tweets) is the highest-requested feature. Build it fast.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Cross-platform publishing engine", description: "Write once, publish to 5+ platforms" },
          { title: "Content calendar & scheduling", description: "Drag-and-drop calendar with auto-publish" },
          { title: "Analytics aggregation dashboard", description: "Unified metrics from all platforms" },
        ];
      if (stage === "seed")
        return [
          { title: "Sponsorship management CRM", description: "Track outreach, deals, and payments" },
          { title: "AI content repurposing", description: "Auto-generate clips, tweets, and newsletters" },
          { title: "Audience segmentation tools", description: "Understand who your fans are and what they want" },
        ];
      return [
        { title: "Creator marketplace & discovery", description: "Match brands with creators automatically" },
        { title: "Membership & subscription engine", description: "Paid communities and exclusive content" },
        { title: "Revenue diversification analytics", description: "Identify and optimize income streams" },
      ];
    },
    roastVerdict: "The creator economy is a feature, not a company. Most tools get replaced by platform-native features within 18 months. Your moat is community, not code.",
    roastRisks: ["Platforms (YouTube, TikTok) build the same features and default-install them", "Creators are price-sensitive and churn quickly", "AI-generated content is flooding the market"],
    roastRecommendations: ["Target micro-creators (1K-50K followers) — they're underserved", "Offer a free tier that's genuinely useful", "Build community features that create switching costs"],
    roastItems: [
      { category: "Platform Risk", rating: 4, feedback: "YouTube and TikTok can build your features overnight. Your moat must be switching costs, not features.", severity: "high" as const },
      { category: "Monetization", rating: 5, feedback: "Creators are cash-poor and tool-rich. A $20/mo subscription is a real decision. Prove 5x time savings.", severity: "high" as const },
      { category: "Feature Depth", rating: 6, feedback: "Cross-posting is table stakes. The real value is analytics that help creators optimize content strategy.", severity: "medium" as const },
      { category: "Target Audience", rating: 6, feedback: "Micro-creators (1K-50K) are underserved and desperate for tools. Macro-creators have custom solutions.", severity: "medium" as const },
      { category: "Competitive Landscape", rating: 5, feedback: "Buffer, Later, Hootsuite, and Sprout Social all exist. Your differentiation is 'creator-first' — make that obvious.", severity: "medium" as const },
      { category: "AI Features", rating: 5, feedback: "AI repurposing is your killer feature. Be able to turn a 20-min YouTube video into 10 tweets, 5 TikToks, and a newsletter.", severity: "high" as const },
    ],
  },
  marketplace: {
    tagline: (_idea: string) => {
      const taglines = [
        "Match buyers and sellers fast",
        "Marketplaces that actually work",
        "Connect supply with demand",
        "Trade without friction",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "Marketplaces suffer from the cold-start problem: no buyers without sellers, no sellers without buyers.",
    solutionMeta: "A managed marketplace platform that jumpstarts both sides through intelligent matching and trust infrastructure.",
    icpTitle: "VP of Growth",
    icpRole: "Growth executive at an existing marketplace",
    icpCompanySize: "20-200 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Growth executive at an existing marketplace looking to improve liquidity and reduce churn."
        : "Independent service provider looking for a platform that brings qualified leads without excessive commission.",
    painPoints: ["Cold-start: acquiring supply and demand simultaneously", "Trust and safety issues scale exponentially with volume", "Payment reconciliation is complex between all parties", "Commission-based revenue creates growth vs. profitability tension"],
    goals: ["Achieve 80% fill rate on the supply side", "Reduce time-to-first-transaction to under 24 hours", "Maintain 99.5% transaction success rate", "Scale to 100K monthly active users"],
    objections: ["\"Marketplaces are winner-take-all — what makes you different?\"", "\"How do you prevent fraud?\"", "\"We already use a custom solution\"", "\"What's your take rate and how does it compare?\""],
    brandMission: "To make every marketplace succeed by solving liquidity before features.",
    brandValues: ["Liquidity first", "Trust as infrastructure", "Fair economics", "Both sides matter"],
    brandTone: ["Strategic and insights-driven", "Confident and experienced", "Fair and balanced", "Data-backed and precise"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Clean marketplace platform site with strong liquidity messaging, but needs more trust signals.",
    websiteStrengths: ["Clear liquidity-first messaging", "Professional, trustworthy design", "Good dual-sided value proposition"],
    websiteImprovements: ["Add case studies from both supply and demand sides", "Include fraud prevention details", "Show marketplace economics calculator", "Add integration examples"],
    websiteRecommendations: [
      "Show a live marketplace map with real transaction volume",
      "Add a 'Trust & Safety' section with fraud prevention details",
      "Include a commission calculator for potential partners",
      "Publish a marketplace playbook with growth strategies",
    ],
    icpRecommendations: [
      "Create a marketplace liquidity assessment tool",
      "Publish a 'Marketplace Growth Playbook' based on successful exits",
      "Offer a supply-side growth guarantee for early partners",
    ],
    insights: [
      { title: "Marketplace Moat", description: "Marketplaces with 10K+ monthly transactions have 5x lower churn. Liquidity is your only real moat.", type: "positive" as const },
      { title: "Vertical Opportunity", description: "Horizontal marketplaces (Craigslist, FB Marketplace) own general. Vertical marketplaces (Angi, Rover) own specific.", type: "opportunity" as const },
      { title: "Liquidity Trap", description: "If either side of your marketplace isn't growing, both sides shrink. 75% of marketplaces die from liquidity death spirals.", type: "warning" as const },
      { title: "Managed vs. Unmanaged", description: "Managed marketplaces (controlling quality on one side) have 3x better unit economics. Go managed from day one.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Core listing engine", description: "Create, search, and book listings" },
          { title: "Payment processing infrastructure", description: "Escrow-based payment with platform fee capture" },
          { title: "Trust & safety baseline", description: "User verification and review system" },
        ];
      if (stage === "seed")
        return [
          { title: "Smart matching algorithm", description: "Connect the right buyers with the right sellers" },
          { title: "Dispute resolution system", description: "Mediation workflow and refund processing" },
          { title: "Supply-side growth tools", description: "Scheduling, analytics, and performance insights" },
        ];
      return [
        { title: "Insurance and protection products", description: "Liability coverage for platform transactions" },
        { title: "API for third-party integrations", description: "Let partners build on your marketplace" },
        { title: "International expansion infrastructure", description: "Multi-currency, localization, and tax handling" },
      ];
    },
    roastVerdict: "Marketplaces are the hardest business model to start and the easiest to scale — if you survive the first 18 months. Liquidity is everything.",
    roastRisks: ["Network effects work both ways — negative reviews create death spirals", "Regulatory risk: are your workers employees or contractors?", "Payment fraud scales with volume"],
    roastRecommendations: ["Be a 'managed marketplace' — control quality on at least one side", "Subsidize the hard side of the marketplace early on", "Build trust signals before you need them"],
    roastItems: [
      { category: "Cold Start Strategy", rating: 4, feedback: "Your plan to acquire both sides simultaneously is the #1 reason marketplaces fail. Pick a side and subsidize it.", severity: "high" as const },
      { category: "Unit Economics", rating: 5, feedback: "Marketplace take rates of 15-25% are standard. If your economics don't work at 15%, they won't work at 25% either.", severity: "high" as const },
      { category: "Trust & Safety", rating: 6, feedback: "One high-profile scam can destroy your marketplace's reputation. Build verifications before you need them.", severity: "medium" as const },
      { category: "Regulatory Risk", rating: 5, feedback: "The 'employee vs. contractor' debate is existential for marketplaces. Plan for a regulated future.", severity: "high" as const },
      { category: "Churn Management", rating: 6, feedback: "Losing supply-side churn creates a death spiral. Build retention tools for your most valuable side.", severity: "medium" as const },
      { category: "Payment Flow", rating: 5, feedback: "Holding funds in escrow creates trust but also cash flow complexity. Partner with Stripe Connect or similar.", severity: "medium" as const },
    ],
  },
  hardware: {
    tagline: (_idea: string) => {
      const taglines = [
        "Hardware that disappears",
        "Physical products, digital brain",
        "Smart hardware, simple setup",
        "Build it, ship it, love it",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "Hardware development is slow, capital-intensive, and unforgiving — one bad batch can kill the company.",
    solutionMeta: "A hardware development platform that streamlines prototyping, manufacturing, and distribution.",
    icpTitle: "VP of Hardware Engineering",
    icpRole: "Hardware engineering executive managing complex supply chains",
    icpCompanySize: "50-500 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Hardware engineering executive managing complex supply chains, multiple prototype iterations, and manufacturing partners."
        : "Hardware hobbyist looking to turn a prototype into a manufactured product without a factory connection.",
    painPoints: ["Hardware prototype iterations cost $10K-50K per spin", "Supply chain disruptions cancel months of progress", "Certification (FCC, CE, UL) timelines are unpredictable", "Manufacturing partners require MOQs that exceed seed budgets"],
    goals: ["Reduce prototype iteration cost by 60%", "Shorten time-to-market from 18 to 12 months", "Build a diversified supplier network", "Simplify certification process through pre-compliance testing"],
    objections: ["\"We have trusted contract manufacturers we've used for years\"", "\"Hardware is too complex for a platform to solve\"", "\"Our designs are proprietary — we can't share them\"", "\"How do you handle IP protection?\""],
    brandMission: "To make hardware development as fast and iterative as software development.",
    brandValues: ["Speed without shortcuts", "Supply chain resilience", "IP protection", "Quality at scale"],
    brandTone: ["Engineering-precise", "Practical and grounded", "Confident but cautious", "Solution-oriented"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Industrial design with engineering-focused messaging, but needs more technical depth and certifications.",
    websiteStrengths: ["Professional engineering-focused design", "Clear value proposition for hardware teams", "Strong supply chain visuals"],
    websiteImprovements: ["Add manufacturing partner quality ratings", "Include certification timeline estimates", "Showcase successful hardware launches", "Add BOM cost estimation tool"],
    websiteRecommendations: [
      "Add a 'Design for Manufacturing' checklist and guide",
      "Include certification cost and timeline database",
      "Showcase supplier ratings and vetted manufacturer network",
      "Add an interactive BOM cost estimator tool",
    ],
    icpRecommendations: [
      "Create a 'Hardware Development Playbook' with timeline and cost benchmarks",
      "Publish supplier quality ratings and audit results",
      "Offer a free prototype cost reduction assessment",
    ],
    insights: [
      { title: "Hardware Renaissance", description: "Hardware VC funding reached $15B in 2024. Investors are hungry for hardware-enabled businesses.", type: "positive" as const },
      { title: "Supply Chain Opportunity", description: "Near-shoring and supply chain diversification is creating a $50B market for hardware tools.", type: "opportunity" as const },
      { title: "Capital Intensity", description: "Hardware requires 3x more capital and 2x more time than software. Plan your fundraising accordingly.", type: "warning" as const },
      { title: "Certification Strategy", description: "Start FCC/CE pre-compliance testing during prototype phase, not after. It saves months of delays.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Proof-of-concept prototype", description: "Functional prototype with off-the-shelf components" },
          { title: "Manufacturing partner database", description: "Vetted CMs for low-volume production" },
          { title: "Cost modeling tool", description: "BOM estimation and margin projection" },
        ];
      if (stage === "seed")
        return [
          { title: "Engineering validation prototype", description: "Design-for-manufacturing iteration" },
          { title: "Certification testing suite", description: "Pre-compliance testing for FCC/CE" },
          { title: "Supply chain management dashboard", description: "Lead time tracking and alternative sourcing" },
        ];
      return [
        { title: "Production tooling & ramp", description: "High-volume manufacturing setup" },
        { title: "Distribution & logistics network", description: "Warehousing and fulfillment partnerships" },
        { title: "Aftermarket service platform", description: "Warranty, repairs, and customer support" },
      ];
    },
    roastVerdict: "Hardware is the least forgiving startup category. Software bugs get patched; hardware bugs get recalled. You need 3x more capital and 2x more time than your optimistic projections suggest.",
    roastRisks: ["A single manufacturing defect can recall your entire inventory", "Supply chain disruptions are outside your control", "Retailers demand 50%+ margins"],
    roastRecommendations: ["Start with a crowdfunding campaign to validate demand before tooling", "Design for assembly — reduce part count", "Keep firmware updatable OTA to fix bugs post-shipment"],
    roastItems: [
      { category: "Capital Requirements", rating: 4, feedback: "Hardware startups need 3x more capital than they think. Your fundraising target should be 2x your current projection.", severity: "high" as const },
      { category: "Supply Chain Risk", rating: 5, feedback: "Single-sourcing components is a bet-your-company risk. Have 2-3 qualified suppliers for every critical component.", severity: "high" as const },
      { category: "Certification Timeline", rating: 5, feedback: "FCC/CE certification takes 3-6 months minimum. Start the process during prototype phase, not after.", severity: "high" as const },
      { category: "Manufacturing Partner Fit", rating: 6, feedback: "Low-volume CMs have different economics than high-volume. Get MOQ commitments in writing before design lock.", severity: "medium" as const },
      { category: "BOM Cost Management", rating: 6, feedback: "BOM costs always exceed initial estimates. Add a 20% buffer to your cost projections.", severity: "medium" as const },
      { category: "Aftermarket Support", rating: 5, feedback: "Hardware returns and repairs can destroy margins. Design for repairability and build a reverse logistics plan.", severity: "medium" as const },
    ],
  },
  services: {
    tagline: (_idea: string) => {
      const taglines = [
        "Services that scale with you",
        "Expert help, on demand",
        "Professional services, modernized",
        "Get expert advice fast",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "Professional services firms still operate on emails, spreadsheets, and 1990s CRM systems.",
    solutionMeta: "A modern practice management platform that automates operations, client communication, and compliance.",
    icpTitle: "Managing Partner",
    icpRole: "Partner at a professional services firm",
    icpCompanySize: "10-200 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Partner at a professional services firm (legal, consulting, accounting) looking to modernize operations."
        : "Independent consultant who needs practice management tools designed for a single practitioner.",
    painPoints: ["Billable time tracking is still done on paper", "Client communication is scattered across email, phone, and Slack", "Compliance and document management is manual", "Project profitability is impossible to calculate in real-time"],
    goals: ["Increase billable utilization from 60% to 80%", "Reduce administrative time by 10 hours/week per professional", "Improve client communication response time by 50%", "Track project profitability in real-time"],
    objections: ["\"We've used the same system for 20 years and it works\"", "\"Partners are resistant to changing how they work\"", "\"We have compliance requirements that need custom solutions\"", "\"Our clients are used to our current process\""],
    brandMission: "To free professionals from administrative work so they can focus on what they do best.",
    brandValues: ["Professional excellence", "Time as value", "Trust through transparency", "Continuous improvement"],
    brandTone: ["Professional and credible", "Respectful of tradition", "Forward-thinking but practical", "Clear and educational"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Professional services website with strong practice management messaging, but needs more ROI proof.",
    websiteStrengths: ["Professional, trustworthy design", "Clear practice management focus", "Good compliance and security messaging"],
    websiteImprovements: ["Add ROI calculators for utilization improvement", "Include partner testimonials", "Show migration timelines from legacy systems", "Add integration directory for accounting tools"],
    websiteRecommendations: [
      "Add a 'Time Savings Calculator' showing hours saved per professional",
      "Include migration guides from Clio, PracticePanther, and legacy systems",
      "Showcase QuickBooks and Xero integration depth",
      "Publish a 'Future of Professional Services' industry report",
    ],
    icpRecommendations: [
      "Create a firm efficiency benchmark report comparing utilization rates",
      "Publish migration guides from legacy practice management tools",
      "Offer a free 'practice audit' with efficiency recommendations",
    ],
    insights: [
      { title: "Utilization Opportunity", description: "Most professional services firms operate at 55-65% utilization. Every 5% improvement adds 10% to the bottom line.", type: "positive" as const },
      { title: "AI in Services", description: "AI document review, contract analysis, and compliance checking will transform services. Early adopters will have a 3-year advantage.", type: "opportunity" as const },
      { title: "Adoption Resistance", description: "Partners at services firms are high-income and low-tech. Adoption requires white-glove onboarding, not self-serve.", type: "warning" as const },
      { title: "Integration Depth", description: "QuickBooks integration is table stakes. Outlook and Slack integration is the real productivity unlock.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Time tracking & billing engine", description: "Capture billable hours and generate invoices" },
          { title: "Client portal MVP", description: "Secure document sharing and communication" },
          { title: "Practice analytics dashboard", description: "Utilization rates and revenue per partner" },
        ];
      if (stage === "seed")
        return [
          { title: "Project management integration", description: "Task tracking with budget vs. actual monitoring" },
          { title: "Compliance document management", description: "Secure storage, retention policies, and e-signatures" },
          { title: "CRM for professional services", description: "Pipeline tracking and relationship management" },
        ];
      return [
        { title: "AI-powered contract analysis", description: "Extract key terms and obligations automatically" },
        { title: "Resource planning & staffing", description: "Match the right people to the right projects" },
        { title: "Client self-service portal", description: "Booking, payments, and status tracking" },
      ];
    },
    roastVerdict: "Professional services firms are slow adopters of technology — they make money by billing hours, so 'efficiency' is actually a threat to their revenue model.",
    roastRisks: ["Partners are high-income and low-tech — they'll resist new tools", "Billable hour model disincentivizes efficiency tools", "Data migration from legacy systems is expensive"],
    roastRecommendations: ["Position as 'premium work, less administrative drag' not 'work faster'", "Offer white-glove onboarding", "Integrate with QuickBooks and Outlook before anything else"],
    roastItems: [
      { category: "Adoption Strategy", rating: 4, feedback: "Partners bill $500+/hour. They won't spend 30 minutes learning your tool. Onboarding must be white-glove.", severity: "high" as const },
      { category: "Value Proposition", rating: 5, feedback: "'Work faster' threatens the billable hour model. Frame as 'higher-value work' instead of 'more efficient'.", severity: "high" as const },
      { category: "Integration Depth", rating: 5, feedback: "Without Outlook and QuickBooks integration, adoption will be zero. Build these before any other feature.", severity: "high" as const },
      { category: "Compliance Requirements", rating: 6, feedback: "Legal and accounting firms have strict document retention policies. Your platform must be audit-ready from day one.", severity: "medium" as const },
      { category: "Data Migration", rating: 5, feedback: "Firms have decades of client data in legacy systems. Offer a dedicated migration concierge service.", severity: "medium" as const },
      { category: "Pricing Model", rating: 6, feedback: "Per-seat pricing doesn't work for firms with fluctuating contractor headcount. Consider per-matter or per-client pricing.", severity: "medium" as const },
    ],
  },
  saas: {
    tagline: (_idea: string) => {
      const taglines = [
        "Software that grows with you",
        "Business tools that work",
        "Solve real problems, make real money",
        "Built for how you work",
      ];
      return taglines[Math.floor(Math.random() * taglines.length)];
    },
    problemMeta: "SMBs buy too many point solutions that don't talk to each other, creating data silos and workflow friction.",
    solutionMeta: "An integrated SaaS platform that replaces 5 tools with one, unified through a shared data model.",
    icpTitle: "VP of Operations",
    icpRole: "Operations leader at a mid-market company",
    icpCompanySize: "50-500 employees",
    icpDesc: (customer: string) =>
      customer.startsWith("b2b")
        ? "Operations leader at a mid-market company drowning in SaaS sprawl — managing 20+ tool subscriptions."
        : "Small business owner who wants professional software without enterprise complexity or pricing.",
    painPoints: ["Team uses 15+ SaaS tools that don't integrate", "Subscription costs have grown 3x faster than headcount", "Data entry is duplicated across 5 systems daily", "IT has no visibility into tool usage or need"],
    goals: ["Consolidate from 15 SaaS tools to 5", "Reduce SaaS spend by 40%", "Eliminate duplicate data entry across systems", "Gain visibility into tool usage and ROI"],
    objections: ["\"We're locked into annual contracts with our existing tools\"", "\"Our team is set in their workflows\"", "\"How long does migration take?\"", "\"What if we need a tool you don't offer?\""],
    brandMission: "To make business software work together so teams can focus on work, not tools.",
    brandValues: ["Simplicity at scale", "Integration-first", "Customer-driven roadmap", "Transparent economics"],
    brandTone: ["Practical and results-driven", "Clear and relatable", "Honest about complexity", "Confident but approachable"],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
    websiteSummary: "Clean SaaS landing page with strong consolidation messaging, but needs more migration detail.",
    websiteStrengths: ["Clear consolidation value proposition", "Professional, clean design", "Good integration messaging"],
    websiteImprovements: ["Add migration timeline estimates", "Include ROI calculator", "Show integration directory depth", "Add customer consolidation stories"],
    websiteRecommendations: [
      "Add a 'SaaS Consolidation Calculator' showing potential savings",
      "Include migration timelines for common tool replacements",
      "Showcase integration marketplace with 100+ connectors",
      "Add a self-service data import wizard",
    ],
    icpRecommendations: [
      "Create a SaaS consolidation assessment tool",
      "Publish migration guides from 10 most common tool stacks",
      "Offer a free 'tool sprawl audit' with actionable recommendations",
    ],
    insights: [
      { title: "SaaS Sprawl Crisis", description: "Average mid-market company uses 177 SaaS applications. Consolidation is a $30B opportunity.", type: "positive" as const },
      { title: "Downmarket Opportunity", description: "Enterprise tools are too expensive for SMBs. Consumer tools lack features. Your mid-market focus hits a sweet spot.", type: "opportunity" as const },
      { title: "Churn Risk", description: "Vertical SaaS products have 30% annual churn. Horizontal platforms with multiple use cases have 10% churn.", type: "warning" as const },
      { title: "Integration Depth", description: "Pre-built integrations with Slack, Google Workspace, and Microsoft 365 are table stakes. Build API-first architecture.", type: "action" as const },
    ],
    roadmapTasks: (stage: string) => {
      if (stage === "ideation" || stage === "pre-seed")
        return [
          { title: "Core workflow engine", description: "Drag-and-drop workflow builder" },
          { title: "Integration API layer", description: "Connect to 10 most common SaaS tools" },
          { title: "Multi-tenant architecture", description: "Isolated data per customer organization" },
        ];
      if (stage === "seed")
        return [
          { title: "Unified search & data model", description: "Cross-tool search and data synchronization" },
          { title: "Role-based access control", description: "Admin, editor, viewer permission levels" },
          { title: "Usage analytics & reporting", description: "Tool adoption and cost allocation dashboard" },
        ];
      return [
        { title: "Marketplace for integrations", description: "Let partners build and publish connectors" },
        { title: "Advanced automation engine", description: "Trigger-based workflows with conditional logic" },
        { title: "Enterprise audit & compliance", description: "SOC 2 Type II, GDPR, and data residency controls" },
      ];
    },
    roastVerdict: "SaaS is the most crowded category in startups. You're not competing against 5 companies — you're competing against 500, plus the 'build vs. buy' decision.",
    roastRisks: ["Every horizontal SaaS category has 20+ well-funded competitors", "Enterprise sales require feature parity with incumbents", "Customer churn is high when switching costs are low"],
    roastRecommendations: ["Pick a vertical (e.g., SaaS for dental practices) before going horizontal", "Offer a 'done for you' setup service", "Build a community-driven product roadmap"],
    roastItems: [
      { category: "Competitive Positioning", rating: 5, feedback: "SaaS consolidation is a crowded space. Your differentiation needs to be immediately obvious or you'll be invisible.", severity: "high" as const },
      { category: "Migration Friction", rating: 4, feedback: "Customers fear migration more than they hate their current tools. Offer white-glove migration support.", severity: "high" as const },
      { category: "Vertical Specialization", rating: 6, feedback: "Going horizontal first is a common mistake. Pick one vertical (e.g., SaaS for marketing agencies) and dominate it.", severity: "medium" as const },
      { category: "Integration Depth", rating: 5, feedback: "10 integrations is a start, but customers expect 50+. Build an integration marketplace so partners contribute.", severity: "medium" as const },
      { category: "Pricing Strategy", rating: 5, feedback: "Replacing 5 tools at $50/mo each means you can charge $150/mo. Make your pricing simpler than the sum of parts.", severity: "medium" as const },
      { category: "Switching Costs", rating: 6, feedback: "Low switching costs mean high churn. Build workflow templates and data history that create stickiness.", severity: "medium" as const },
    ],
  },
} as const;

/* ─── Stage-based modifiers ─── */

const stageModifiers: Record<string, {
  revenueModel: (bm: string, price?: string) => string;
  revenuePricing: (bm: string, price?: string) => string;
  revenueJustification: string;
  roastScore: number;
  roastBonusRisks: string[];
  funding: string;
  teamSize: number;
  foundedDate: string;
  monthsToProject: number;
}> = {
  ideation: {
    revenueModel: (bm, price) => `Pre-revenue ${bm} model — targeting ${price || "TBD"}/mo`,
    revenuePricing: (bm, price) => `Target: ${price || "$XX"}/mo per seat (to be validated)`,
    revenueJustification: "At ideation stage, revenue projections are speculative. Focus on customer discovery interviews to validate willingness to pay before building pricing.",
    roastScore: 4,
    roastBonusRisks: ["No revenue means every assumption about pricing is unvalidated", "Ideation-stage startups have a 90% failure rate before reaching PMF"],
    funding: "$0 (Bootstrapped)",
    teamSize: 1,
    foundedDate: "Jan 2025",
    monthsToProject: 18,
  },
  "pre-seed": {
    revenueModel: (bm, price) => `Pre-seed ${bm} — initial pricing set at ${price || "TBD"}/mo`,
    revenuePricing: (bm, price) => `${price || "$XX"}/mo per seat — early adopter pricing`,
    revenueJustification: "At pre-seed, pricing should incentivize early adoption. Consider a 'design partner' discount in exchange for product feedback and case study rights.",
    roastScore: 5,
    roastBonusRisks: ["Pre-seed startups have 6-12 months of runway on average", "Founder-led sales doesn't scale — you need repeatable motions"],
    funding: "$250K (Friends & Family)",
    teamSize: 2,
    foundedDate: "Feb 2025",
    monthsToProject: 18,
  },
  seed: {
    revenueModel: (bm, price) => `Seed-stage ${bm} — ${price || "$XX"}/mo with tiered plans`,
    revenuePricing: (bm, price) => `${price || "$XX"}/mo (starter) to ${getHigherTier(price)} (growth)`,
    revenueJustification: "At seed stage, pricing should balance acquisition velocity with unit economics. A self-serve low-touch plan can drive adoption while sales-assisted plans build revenue quality.",
    roastScore: 6,
    roastBonusRisks: ["Seed-stage churn kills your Series A narrative", "Over-reliance on founder-led sales hides lack of product-market fit"],
    funding: "$2M (Seed)",
    teamSize: 5,
    foundedDate: "Jun 2024",
    monthsToProject: 12,
  },
  growth: {
    revenueModel: (bm, price) => `Growth-stage ${bm} — ${price || "$XX"}/mo with enterprise tiers`,
    revenuePricing: (bm, price) => `${price || "$XX"}/mo (self-serve) to custom enterprise pricing`,
    revenueJustification: "At growth stage, prioritize expansion revenue (upsells, cross-sells) over new logo acquisition. Unit economics should improve 20%+ YoY through scale efficiencies.",
    roastScore: 7,
    roastBonusRisks: ["Growth-stage companies die from 'growth at all costs' cash incineration", "Enterprise deals can stall for 6+ months — pipeline management is critical"],
    funding: "$10M (Series A)",
    teamSize: 20,
    foundedDate: "Jan 2024",
    monthsToProject: 12,
  },
};

function getHigherTier(price?: string): string {
  if (!price) return "$XXX";
  const map: Record<string, string> = {
    "<$10": "$25/mo",
    "$10-50": "$150/mo",
    "$50-200": "$500/mo",
    "$200-1000": "$2,500/mo",
    "$1000+": "$5,000+/mo",
  };
  return map[price] || "$XXX";
}

/* ─── Revenue descriptions ─── */

const _revenueDescriptions: Record<string, string> = {
  subscription: "Recurring subscription with monthly or annual billing cycles",
  usage: "Pay-as-you-go metered billing based on consumption",
  "one-time": "Perpetual license or one-time purchase with optional maintenance",
  marketplace: "Commission-based take rate on each transaction",
  free: "Free tier supported by ads, donations, or data monetization",
};

/* ─── Problem-based roast modifiers ─── */

const problemRoastModifiers: Record<string, {
  risk: string;
  recommendation: string;
}> = {
  cost: {
    risk: "\"Cheaper\" is a race to the bottom — competitors will undercut you on price",
    recommendation: "Compete on value, not price. Quantify ROI in terms of time saved, revenue gained, or risk avoided.",
  },
  access: {
    risk: "Access problems often require behavioral change — the hardest thing to sell",
    recommendation: "Offer a 'try before you buy' experience that demonstrates the access improvement immediately.",
  },
  performance: {
    risk: "Performance expectations increase every quarter — today's 'fast' is tomorrow's 'slow'",
    recommendation: "Publish public benchmarks and SLA guarantees to turn performance into a competitive moat.",
  },
  integration: {
    risk: "Integration products have adoption barriers — if the user needs to change their workflow, they won't",
    recommendation: "Build for 'invisible integration' that works with existing tools via APIs and no-code connectors.",
  },
  security: {
    risk: "Security products face the highest scrutiny and longest procurement cycles",
    recommendation: "Publish a SOC 2 report, penetration test results, and security whitepaper before the first sales call.",
  },
};

const defaultProfileKey = "saas";

/* ─── Default competitors generator ─── */

function getDefaultCompetitors(industry: string): { name: string; strength: string; weakness: string; opportunity: string }[] {
  const defaults: Record<string, { name: string; strength: string; weakness: string; opportunity: string }[]> = {
    saas: [
      { name: "Salesforce", strength: "Market leader, massive ecosystem", weakness: "Complex, expensive, slow to innovate", opportunity: "Simplified vertical SaaS" },
      { name: "HubSpot", strength: "Great UX, strong marketing", weakness: "Limited customization, pricing creep", opportunity: "Affordable alternative for SMBs" },
      { name: "Zoho", strength: "Affordable, wide product suite", weakness: "Fragmented products, weak integrations", opportunity: "Unified platform with better UX" },
    ],
    ecommerce: [
      { name: "Shopify", strength: "Dominant platform, huge app ecosystem", weakness: "Generic templates, high transaction fees", opportunity: "Vertical-specific commerce" },
      { name: "WooCommerce", strength: "Open-source, customizable", weakness: "Requires technical setup, hosting complexity", opportunity: "Managed WooCommerce alternative" },
      { name: "BigCommerce", strength: "Headless commerce, B2B features", weakness: "Smaller ecosystem, developer-heavy", opportunity: "No-code B2B commerce" },
    ],
    creator: [
      { name: "Patreon", strength: "Dominant creator platform, strong brand", weakness: "High fees, limited customization", opportunity: "White-label creator tools" },
      { name: "Substack", strength: "Simple newsletter monetization", weakness: "Email-only, limited product types", opportunity: "Multi-product creator platform" },
      { name: "Gumroad", strength: "Easy digital product sales", weakness: "Basic features, no subscription management", opportunity: "Full creator commerce suite" },
    ],
    marketplace: [
      { name: "Upwork", strength: "Largest freelance marketplace", weakness: "Race to bottom pricing, trust issues", opportunity: "Curated expert marketplace" },
      { name: "Fiverr", strength: "Brand recognition, easy to use", weakness: "Low-quality offerings, high fees", opportunity: "Premium service marketplace" },
      { name: "Toptal", strength: "Vetted talent, enterprise focus", weakness: "Expensive, limited talent pool", opportunity: "Mid-market vetted marketplace" },
    ],
  };
  return defaults[industry] || defaults.saas;
}

/* ─── Revenue projection generator ─── */

function generateRevenueProjections(
  stage: string,
  _businessModel: string,
  monthsToProject: number
): { month: string; projected: number; actual: number | null }[] {
  const results: { month: string; projected: number; actual: number | null }[] = [];

  // Stage-based revenue caps (REALISTIC)
  const stageCaps: Record<string, { maxMonthly: number; startMonthly: number; growthRate: number }> = {
    ideation:    { maxMonthly: 5000,    startMonthly: 0,     growthRate: 1.4 },
    "pre-seed":  { maxMonthly: 20000,   startMonthly: 1000,  growthRate: 1.35 },
    seed:        { maxMonthly: 100000,  startMonthly: 5000,  growthRate: 1.25 },
    growth:      { maxMonthly: 1000000, startMonthly: 50000, growthRate: 1.2 },
  };

  const cap = stageCaps[stage] || stageCaps.ideation;

  for (let i = 0; i < monthsToProject && i < months.length; i++) {
    const month = months[i % 12];
    const year = i >= 12 ? 1 : 0;
    const label = year === 0 ? month : `${month} '${String((new Date().getFullYear() + year) % 100).padStart(2, "0")}`;

    if (stage === "ideation" && i < 6) {
      // Ideation: first 6 months are $0 (customer discovery phase)
      results.push({ month: label, projected: 0, actual: i === 0 ? 0 : null });
    } else if (stage === "pre-seed" && i < 3) {
      // Pre-seed: first 3 months are $0 (building MVP)
      results.push({ month: label, projected: 0, actual: null });
    } else {
      // Realistic growth curve with noise
      const monthsFromStart = stage === "ideation" ? i - 6 : stage === "pre-seed" ? i - 3 : i;
      const baseGrowth = Math.pow(cap.growthRate, monthsFromStart);
      const noise = 0.85 + Math.random() * 0.3; // 15% variance
      const projected = Math.round(Math.min(cap.startMonthly * baseGrowth * noise, cap.maxMonthly));
      results.push({ month: label, projected, actual: null });
    }
  }

  return results;
}

/* ─── URL generator ─── */

function generateUrl(_startupName: string): string {
  // NEVER fabricate URLs — use placeholder to prevent hallucination
  return "yourstartup.example.com";
}

/* ─── Stage label ─── */

const stageLabelMap: Record<string, string> = {
  ideation: "Ideation",
  "pre-seed": "Pre-Seed",
  seed: "Seed",
  growth: "Growth",
};

const industryLabelMap: Record<string, string> = {
  ai: "AI / ML / Infrastructure",
  fintech: "FinTech",
  healthtech: "HealthTech / Bio",
  ecommerce: "E-Commerce / Retail",
  devtools: "Developer Tools",
  climate: "Climate / CleanTech",
  edtech: "EdTech",
  gaming: "Gaming",
  creator: "Creator Economy",
  marketplace: "Marketplace",
  hardware: "Hardware / IoT",
  services: "Professional Services",
  saas: "SaaS / Software",
};

/* ─── Blueprint Generator ─── */

export function generateBlueprint(data: InterviewData): StartupBlueprint {
  const profile = industryProfiles[data.industry as keyof typeof industryProfiles] || industryProfiles[defaultProfileKey];
  const stageMod = stageModifiers[data.stage] || stageModifiers.ideation;
  const problemMod = problemRoastModifiers[data.problem];
  const _customerType = data.targetCustomer;

  // Extract startup name from the idea text (first 2-3 words)
  const words = data.idea.trim().split(/\s+/);
  const startupName = words
    .slice(0, Math.min(3, words.length))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const tagline = profile.tagline(data.idea);

  // Company snapshot
  const companySnapshot = {
    stage: stageLabelMap[data.stage] || data.stage,
    industry: industryLabelMap[data.industry] || data.industry,
    funding: stageMod.funding,
    teamSize: stageMod.teamSize,
    foundedDate: stageMod.foundedDate,
  };

  // Stats (derived from industry/stage)
  const stats = {
    brandScore: Math.min(95, 60 + (data.stage === "growth" ? 25 : data.stage === "seed" ? 15 : 10)),
    marketFit: data.stage === "growth" ? "A-" : data.stage === "seed" ? "B+" : data.stage === "pre-seed" ? "B" : "C+",
    readiness: Math.min(100, 40 + (data.stage === "growth" ? 40 : data.stage === "seed" ? 25 : 15)),
    growthScore: Math.min(95, 55 + (data.stage === "growth" ? 30 : data.stage === "seed" ? 20 : 10)),
  };

  // Insights from profile (with stage-aware modifications)
  const insights = profile.insights.map((insight, i) => {
    if (i === 2 && (data.stage === "ideation" || data.stage === "pre-seed")) {
      return {
        ...insight,
        description: insight.description.replace("limited runway", `${stageMod.monthsToProject} months of runway`),
      };
    }
    return insight;
  });

  // Website
  const url = generateUrl(startupName);
  const website = {
    url,
    summary: profile.websiteSummary,
    strengths: [...profile.websiteStrengths],
    improvements: [...profile.websiteImprovements],
    recommendations: [...profile.websiteRecommendations],
  };

  // Brand
  const colorKey = data.industry in industryColorSchemes ? data.industry as keyof typeof industryColorSchemes : "saas";
  const colors = industryColorSchemes[colorKey] || industryColorSchemes.saas;
  const brand = {
    mission: profile.brandMission,
    values: [...profile.brandValues],
    tone: [...profile.brandTone],
    colors,
    typography: profile.typography,
  };

  // Logos
  const logoKey = data.industry in logoConcepts ? data.industry as keyof typeof logoConcepts : "saas";
  const concepts = logoConcepts[logoKey] || logoConcepts.saas;
  const logos = concepts.map((c, i) => ({
    id: String(i + 1),
    description: c.description,
    style: c.style,
    preview: startupName,
    colors: [colors[0].hex, colors[1].hex] as string[],
  }));

  // Build ICP (domain-aware v2)
  const icp = composeIcp(data, profile);

  // Get competitors (from profile or defaults)
  const competitors = (profile as { competitors?: { name: string; strength: string; weakness: string; opportunity: string }[] }).competitors || getDefaultCompetitors(data.industry);

  // Build revenue
  const revenueModel = stageMod.revenueModel(data.businessModel, data.priceRange);
  const revenuePricing = stageMod.revenuePricing(data.businessModel, data.priceRange);
  const revenueJustification = stageMod.revenueJustification;
  const projections = generateRevenueProjections(data.stage, data.businessModel, stageMod.monthsToProject);
  const revenue = {
    model: revenueModel,
    pricing: revenuePricing,
    justification: revenueJustification,
    projections,
    funding: stageMod.funding,
    analysis: `${startupName} — ${revenueJustification}`,
  };

  // Build roadmap
  const roadmapTasks = profile.roadmapTasks(data.stage);
  const roadmap: StartupBlueprint["roadmap"] = [
    {
      quarter: "Phase 1: Foundation",
      items: [
        { title: roadmapTasks[0]?.title || "Complete 20 customer interviews", description: roadmapTasks[0]?.description || "Interview 20 target customers, document pain points, identify 3 design partners", status: "in-progress" as const },
        { title: roadmapTasks[1]?.title || "Ship MVP core feature", description: roadmapTasks[1]?.description || "Build and deploy the single most important feature, get 5 beta users", status: "planned" as const },
        { title: roadmapTasks[2]?.title || "Validate willingness to pay", description: roadmapTasks[2]?.description || "Collect $500+ in pre-orders or letters of intent", status: "planned" as const },
      ],
    },
    {
      quarter: "Phase 2: Product-Market Fit",
      items: [
        { title: "Launch to 50 early adopters", description: "Onboard 50 users, achieve 40%+ weekly retention", status: "planned" as const },
        { title: "Iterate based on usage data", description: "Ship 3 feature iterations based on user feedback, measure NPS > 40", status: "planned" as const },
        { title: "Achieve first revenue", description: "Convert 10% of free users to paid, reach $2K MRR", status: "planned" as const },
      ],
    },
    {
      quarter: "Phase 3: Growth",
      items: [
        { title: "Scale acquisition channels", description: "Identify 2 channels with CAC < LTV/3, spend $5K/mo profitably", status: "planned" as const },
        { title: "Hire first employee", description: "Bring on a full-stack engineer or sales lead to accelerate growth", status: "planned" as const },
        { title: "Hit $10K MRR", description: "Reach $10K MRR with 100+ paying customers", status: "planned" as const },
      ],
    },
  ];

  // Set first item as "done" if pre-seed or later
  if (data.stage !== "ideation") {
    roadmap[0].items[0] = { ...roadmap[0].items[0], status: "done" };
  }
  if (data.stage === "seed" || data.stage === "growth") {
    roadmap[0].items[1] = { ...roadmap[0].items[1], status: "done" };
  }

  // Build roast
  const baseScore = stageMod.roastScore;
  const severityPenalty = data.problem === "security" ? -1 : data.problem === "cost" ? 0 : 1;
  const roastScore = Math.max(2, Math.min(9, baseScore + severityPenalty));

  const roastRisks = [
    ...profile.roastRisks,
    ...stageMod.roastBonusRisks,
    problemMod?.risk,
  ].filter(Boolean) as string[];

  const roastRecommendations = [
    ...profile.roastRecommendations,
    problemMod?.recommendation,
  ].filter(Boolean) as string[];

  // Roast items — use profile items but adjust scores based on stage
  const roastItems = profile.roastItems.map((item) => ({
    ...item,
    rating: Math.max(1, Math.min(10, item.rating + (data.stage === "growth" ? 2 : data.stage === "seed" ? 1 : 0))),
  }));

  // Build verdict (v2 — independent 7-dimension assessment)
  const verdict = computeVerdict(data);
  // Personalize verdict summary with startup name
  verdict.summary = `${startupName}: ${verdict.summary}`;

  const blueprint = {
    startupName,
    tagline,

    problem: profile.problemMeta,
    solution: profile.solutionMeta,

    companySnapshot,
    stats,
    insights,

    website,
    brand,
    logos,

    icp,

    competitors,

    revenue,

    roadmap,

    verdict,

        roast: {
      score: roastScore,
      verdict: `${startupName} — ${profile.roastVerdict}`,
      risks: roastRisks,
      recommendations: roastRecommendations,
      items: roastItems,
    },
  };

  // Post-generation jargon cleaning
  const bannedPhrases = [
    "leverage", "disrupt", "synergy", "ecosystem", "scalable",
    "innovative", "game-changing", "revolutionary", "cutting-edge",
    "next-gen", "seamless", "end-to-end", "world-class", "best-in-class",
    "empower", "transform", "streamline", "unlock", "next-generation",
    "groundbreaking",
  ];

  function cleanJargon(text: string): string {
    let cleaned = text;
    for (const phrase of bannedPhrases) {
      const regex = new RegExp(`\\b${phrase}\\b`, "gi");
      cleaned = cleaned.replace(regex, "");
    }
    // Clean up double spaces
    cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
    return cleaned;
  }

  // Clean jargon from key text fields
  blueprint.tagline = cleanJargon(blueprint.tagline) as typeof blueprint.tagline;
  blueprint.problem = cleanJargon(blueprint.problem) as typeof blueprint.problem;
  blueprint.solution = cleanJargon(blueprint.solution) as typeof blueprint.solution;
  blueprint.brand.mission = cleanJargon(blueprint.brand.mission) as typeof blueprint.brand.mission;
  blueprint.verdict.summary = cleanJargon(blueprint.verdict.summary) as typeof blueprint.verdict.summary;
  blueprint.roast.verdict = cleanJargon(blueprint.roast.verdict);

  // Clean jargon from insights
  blueprint.insights = blueprint.insights.map((insight: any) => ({
    ...insight,
    title: cleanJargon(insight.title),
    description: cleanJargon(insight.description),
  }));

  // Clean jargon from website
  blueprint.website.summary = cleanJargon(blueprint.website.summary) as typeof blueprint.website.summary;
  blueprint.website.strengths = blueprint.website.strengths.map(cleanJargon) as typeof blueprint.website.strengths;
  blueprint.website.improvements = blueprint.website.improvements.map(cleanJargon) as typeof blueprint.website.improvements;
  blueprint.website.recommendations = blueprint.website.recommendations.map(cleanJargon) as typeof blueprint.website.recommendations;

  // Clean jargon from ICP
  blueprint.icp.description = cleanJargon(blueprint.icp.description);
  blueprint.icp.painPoints = blueprint.icp.painPoints.map(cleanJargon);
  blueprint.icp.goals = blueprint.icp.goals.map(cleanJargon);
  blueprint.icp.objections = blueprint.icp.objections.map(cleanJargon);
  blueprint.icp.recommendations = blueprint.icp.recommendations.map(cleanJargon);

  // Clean jargon from roast
  blueprint.roast.risks = blueprint.roast.risks.map(cleanJargon);
  blueprint.roast.recommendations = blueprint.roast.recommendations.map(cleanJargon);
  blueprint.roast.items = blueprint.roast.items.map((item: any) => ({
    ...item,
    feedback: cleanJargon(item.feedback),
  }));

  // Clean jargon from verdict
  blueprint.verdict.fatalRisks = blueprint.verdict.fatalRisks.map(cleanJargon);
  blueprint.verdict.strengths = blueprint.verdict.strengths.map((s: any) => ({
    ...s,
    explanation: cleanJargon(s.explanation),
  }));
  blueprint.verdict.weaknesses = blueprint.verdict.weaknesses.map((w: any) => ({
    ...w,
    explanation: cleanJargon(w.explanation),
  }));

  return blueprint;
}
