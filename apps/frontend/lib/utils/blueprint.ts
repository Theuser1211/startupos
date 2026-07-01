import type { StartupBlueprint } from "@/lib/types";

interface RawBrand {
  mission?: string;
  values?: string[];
  tone?: string[];
  colors?: { name: string; hex: string }[];
  typography?: { heading: string; body: string };
}

interface RawBlueprintContent {
  name?: string;
  description?: string;
  industry?: string;
  problemStatement?: string;
  solution?: string;
  targetAudience?: string;
  keyFeatures?: string[];
  monetization?: string;
  techStack?: string[];
  competitorAnalysis?: string[];
  roadmap?: string[];
  brand?: RawBrand;
}

interface RawBlueprint {
  id?: string;
  content: RawBlueprintContent | string;
  createdAt?: string;
  updatedAt?: string;
  startupId?: string;
}

function parseJsonStrings(arr?: string[]): Record<string, string>[] {
  if (!arr) return [];
  return arr.map((s) => {
    try {
      return JSON.parse(s);
    } catch {
      return {};
    }
  });
}

function generateRoastSections(content: RawBlueprintContent) {
  const name = content.name || "Startup";
  return {
    score: 6.5,
    verdict: `${name} has a solid foundation but needs refinement in execution strategy and market positioning.`,
    items: [
      { category: "Problem Clarity", rating: 7, feedback: content.problemStatement?.slice(0, 100) || "Clear problem identified", severity: "low" as const },
      { category: "Solution Fit", rating: 6, feedback: content.solution?.slice(0, 100) || "Solution addresses the problem but needs more differentiation", severity: "medium" as const },
      { category: "Market Size", rating: 5, feedback: "Market opportunity exists but TAM/SAM analysis needs more detail", severity: "medium" as const },
      { category: "Business Model", rating: 6, feedback: content.monetization?.slice(0, 100) || "Revenue model is reasonable but unit economics need validation", severity: "low" as const },
      { category: "Technical Feasibility", rating: 7, feedback: `Leverages ${(content.techStack || ["modern"]).slice(0, 2).join(", ")} — achievable with the right team`, severity: "low" as const },
      { category: "Go-to-Market", rating: 5, feedback: "GTM strategy needs more concrete channel plans and customer acquisition cost estimates", severity: "medium" as const },
    ],
    risks: [
      `${(content.competitorAnalysis?.length || 0) > 0 ? "Existing competitors like " + parseJsonStrings(content.competitorAnalysis).map((c: Record<string, string>) => c.company).filter(Boolean).join(", ") : "Established players"} may already address similar needs`,
      "Customer acquisition in this space typically requires significant upfront investment",
      "Execution risk during the initial development phase without sufficient runway",
    ],
    recommendations: [
      "Validate core assumptions with 20+ customer discovery interviews before building",
      "Focus on a single vertical/segment for initial traction rather than horizontal expansion",
      "Develop a clear 12-month roadmap with specific milestones and funding requirements",
    ],
  };
}

function generateVerdict(content: RawBlueprintContent) {
  const score = 65;
  return {
    badge: "conditional" as const,
    badgeLabel: "Conditional Pass",
    compositeScore: score,
    summary: `${content.name || "The startup"} addresses a real problem with a reasonable solution. The idea is promising but needs stronger validation and a clearer path to market. Focus on customer discovery and refining the go-to-market strategy before scaling.`,
    dimensions: {
      market: { score: 65, label: "Market Potential", description: "Market exists but competitive landscape needs more analysis" },
      timing: { score: 70, label: "Timing & Momentum", description: "Good timing — the market is ready for solutions in this space" },
      competition: { score: 55, label: "Competitive Position", description: "Competitive differentiation needs strengthening" },
      defensibility: { score: 50, label: "Defensibility", description: "Low technical moat — consider IP, network effects, or data advantages" },
      founderFit: { score: 70, label: "Founder-Market Fit", description: "Founder understands the problem space but may need complementary skills" },
      distribution: { score: 55, label: "Distribution Strategy", description: "Customer acquisition channels need more concrete planning" },
      revenue: { score: 60, label: "Revenue Model", description: "Business model is reasonable but unit economics need validation" },
    },
    strengths: [
      { dimension: "Problem", score: 75, explanation: `${content.problemStatement?.slice(0, 80) || "Clear problem"}` },
      { dimension: "Solution", score: 70, explanation: `${content.solution?.slice(0, 80) || "Solution approach"}` },
    ],
    weaknesses: [
      { dimension: "Competition", score: 45, explanation: "Competitive differentiation needs more work" },
      { dimension: "Defensibility", score: 40, explanation: "Limited barriers to entry identified" },
    ],
    fatalRisks: [
      "Insufficient differentiation from existing solutions",
      "Customer acquisition cost may exceed projections in a competitive market",
    ],
    suggestedPivot: null,
    confidence: 65,
    confidenceLabel: "Medium Confidence",
    confidenceBreakdown: {
      dataCompleteness: 60,
      stageMaturity: 50,
      dimensionAgreement: 70,
      industrySignal: 65,
    },
    improvementPaths: [
      { dimension: "Defensibility", action: "Identify unique data, network effect, or IP advantages", scoreGain: 15, risk: null, scoreLoss: null },
      { dimension: "Distribution", action: "Define specific customer acquisition channels with cost estimates", scoreGain: 12, risk: "Over-reliance on paid channels", scoreLoss: 8 },
      { dimension: "Competition", action: "Conduct detailed competitive analysis to identify positioning gaps", scoreGain: 10, risk: null, scoreLoss: null },
    ],
  };
}

function parseRoadmap(roadmap?: string[]): { quarter: string; items: { title: string; description: string; status: "done" | "in-progress" | "planned" }[] }[] {
  const items = parseJsonStrings(roadmap);
  return items.map((item: Record<string, string>, i: number) => ({
    quarter: `Q${(i % 4) + 1} ${2025 + Math.floor(i / 4)}`,
    items: [
      {
        title: item.milestone || `Phase ${i + 1}`,
        description: item.deliverables || item.timeline || "",
        status: (i === 0 ? "in-progress" : "planned") as "done" | "in-progress" | "planned",
      },
    ],
  }));
}

function parseCompetitors(analysis?: string[]) {
  return parseJsonStrings(analysis).map((c: Record<string, string>) => ({
    name: c.company || "Unknown",
    strength: c.strengths || "",
    weakness: c.weaknesses || "",
    opportunity: "",
  }));
}

export function normalizeBlueprint(raw: RawBlueprint | undefined | null): StartupBlueprint | null {
  if (!raw) return null;

  const content: RawBlueprintContent =
    typeof raw.content === "string" ? tryParse<RawBlueprintContent>(raw.content, {})
    : raw.content || {};

  const name = content.name || "My Startup";
  const description = content.description || "";
  const industry = content.industry || "";

  return {
    startupName: name,
    tagline: description,
    problem: content.problemStatement || "",
    solution: content.solution || "",
    companySnapshot: {
      stage: "Ideation",
      industry,
      funding: "Pre-seed",
      teamSize: 1,
      foundedDate: new Date().toISOString().split("T")[0],
    },
    stats: {
      brandScore: 7,
      marketFit: "Strong",
      readiness: 6,
      growthScore: 7,
    },
    insights: [
      { title: "Core Value Proposition", description: description.slice(0, 200) || "Solving a key market problem", type: "positive" },
      ...(content.keyFeatures || []).slice(0, 3).map((f: string, i: number) => ({
        title: i === 0 ? "Key Feature" : i === 1 ? "Differentiator" : "Growth Lever",
        description: f,
        type: "positive" as const,
      })),
      { title: "Market Position", description: `Operating in the ${industry || "technology"} space`, type: "opportunity" },
    ],
    website: {
      url: "",
      summary: description,
      strengths: [],
      improvements: [],
      recommendations: [],
    },
    brand: (() => {
      const aiBrand = (content as { brand?: RawBrand }).brand;
      return {
        mission: aiBrand?.mission || description || `To revolutionize the ${industry || "technology"} industry`,
        values: aiBrand?.values?.length ? aiBrand.values : ["Innovation", "User-Centric", "Transparency", "Quality"],
        tone: aiBrand?.tone?.length ? aiBrand.tone : ["Professional", "Approachable", "Confident", "Clear"],
        colors: aiBrand?.colors?.length ? aiBrand.colors : [
          { name: "Primary", hex: "#7C3AED" },
          { name: "Secondary", hex: "#06B6D4" },
          { name: "Accent", hex: "#F59E0B" },
          { name: "Neutral", hex: "#64748B" },
        ],
        typography: aiBrand?.typography?.heading ? aiBrand.typography : { heading: "Inter", body: "Inter" },
      };
    })(),
    logos: [],
    generationMetadata: undefined,
    icp: {
      title: content.targetAudience || "Ideal Customer Profile",
      role: "Decision Maker",
      companySize: "Small to Medium",
      description: content.targetAudience || "Target customers in need of this solution",
      painPoints: [
        content.problemStatement?.slice(0, 100) || "Inefficient current solutions",
        "Limited access to quality alternatives",
        "High cost of existing options",
      ],
      goals: [
        "Solve the core problem efficiently",
        "Reduce operational costs",
        "Improve productivity and outcomes",
      ],
      objections: [
        "Budget constraints for new solutions",
        "Integration complexity with existing tools",
        "Concerns about ROI and implementation timeline",
      ],
      recommendations: [
        "Offer a free tier or trial to reduce adoption friction",
        "Provide clear ROI calculators and case studies",
        "Ensure seamless integration with popular existing tools",
      ],
    },
    competitors: parseCompetitors(content.competitorAnalysis),
    revenue: {
      model: content.monetization || "Subscription-based",
      pricing: content.monetization || "Tiered pricing based on features and usage",
      justification: "Revenue model aligns with industry standards and customer willingness to pay",
      projections: [
        { month: "Month 1", projected: 0, actual: null },
        { month: "Month 3", projected: 5000, actual: null },
        { month: "Month 6", projected: 15000, actual: null },
        { month: "Month 12", projected: 50000, actual: null },
      ],
      funding: "Pre-seed / Bootstrapped",
      analysis: `${name} operates with a ${content.monetization?.toLowerCase().includes("subscription") ? "recurring revenue model which provides predictable cash flow" : "revenue model that needs validation through customer discovery"}. ${(content.competitorAnalysis?.length || 0) > 0 ? "Market analysis shows room for differentiation." : "Further market research is needed to validate pricing assumptions."}`,
    },
    roadmap: parseRoadmap(content.roadmap),
    roast: generateRoastSections(content),
    verdict: generateVerdict(content),
  };
}

function tryParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}