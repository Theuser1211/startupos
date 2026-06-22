import type { StartupBlueprint, RawBlueprintContent, RawBlueprint } from "@/lib/types";

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

function parseRoadmap(roadmap?: string[]): { quarter: string; items: { title: string; description: string; status: "done" | "in-progress" | "planned" }[] }[] {
  const items = parseJsonStrings(roadmap);
  if (items.length === 0) return [];
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
    name: c.competitor || c.company || "Unknown",
    strength: c.strengths || "",
    weakness: c.weaknesses || "",
    opportunity: "",
  }));
}

function deriveBrand(content: RawBlueprintContent): StartupBlueprint["brand"] {
  const industryColors: Record<string, { name: string; hex: string }[]> = {
    fintech: [
      { name: "Primary", hex: "#0F766E" },
      { name: "Secondary", hex: "#0891B2" },
      { name: "Accent", hex: "#F59E0B" },
      { name: "Neutral", hex: "#64748B" },
    ],
    healthtech: [
      { name: "Primary", hex: "#0891B2" },
      { name: "Secondary", hex: "#06B6D4" },
      { name: "Accent", hex: "#10B981" },
      { name: "Neutral", hex: "#64748B" },
    ],
    ecommerce: [
      { name: "Primary", hex: "#E11D48" },
      { name: "Secondary", hex: "#F43F5E" },
      { name: "Accent", hex: "#F59E0B" },
      { name: "Neutral", hex: "#64748B" },
    ],
  };

  const industry = (content.industry || "").toLowerCase().replace(/[^a-z]/g, "");
  const matchingKey = Object.keys(industryColors).find((k) => industry.includes(k));
  const colors = matchingKey ? industryColors[matchingKey] : [
    { name: "Primary", hex: "#7C3AED" },
    { name: "Secondary", hex: "#06B6D4" },
    { name: "Accent", hex: "#F59E0B" },
    { name: "Neutral", hex: "#64748B" },
  ];

  return {
    mission: content.description || `To revolutionize the ${content.industry || "technology"} industry`,
    values: ["Innovation", "User-Centric", "Transparency", "Quality"],
    tone: ["Professional", "Approachable", "Confident", "Clear"],
    colors,
    typography: { heading: "Inter", body: "Inter" },
  };
}

function deriveIcp(content: RawBlueprintContent): StartupBlueprint["icp"] {
  const audience = content.targetAudience || "Target customers";
  return {
    title: audience,
    role: "Decision Maker",
    companySize: "Small to Medium",
    description: audience,
    painPoints: [
      content.problemStatement?.split(".")[0] || "Inefficient current solutions",
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
  };
}

function deriveRevenue(content: RawBlueprintContent): StartupBlueprint["revenue"] {
  return {
    model: content.monetization || "Subscription-based",
    pricing: content.monetization || "Tiered pricing",
    justification: "Revenue model based on market analysis and customer willingness to pay",
    projections: [
      { month: "Month 1", projected: 0, actual: null },
      { month: "Month 3", projected: 5000, actual: null },
      { month: "Month 6", projected: 15000, actual: null },
      { month: "Month 12", projected: 50000, actual: null },
    ],
    funding: "Pre-seed / Bootstrapped",
    analysis: `${content.name || "The startup"} operates with a ${(content.monetization || "").toLowerCase().includes("subscription") ? "recurring revenue model which provides predictable cash flow" : "revenue model that needs validation through customer discovery"}.`,
  };
}

function deriveStats(content: RawBlueprintContent): StartupBlueprint["stats"] {
  const featureCount = content.keyFeatures?.length || 0;
  const competitorCount = content.competitorAnalysis?.length || 0;
  return {
    brandScore: Math.min(10, Math.max(1, 5 + Math.floor(featureCount / 2))),
    marketFit: competitorCount > 0 ? "Competitive" : "Emerging",
    readiness: Math.min(10, Math.max(1, 4 + featureCount)),
    growthScore: Math.min(10, Math.max(1, 5 + Math.floor(featureCount / 3))),
  };
}

function deriveInsights(content: RawBlueprintContent): StartupBlueprint["insights"] {
  const insights: StartupBlueprint["insights"] = [];
  if (content.problemStatement) {
    insights.push({ title: "Core Problem", description: content.problemStatement.split(".")[0], type: "positive" });
  }
  if (content.solution) {
    insights.push({ title: "Solution Approach", description: content.solution.split(".")[0], type: "positive" });
  }
  if (content.keyFeatures) {
    content.keyFeatures.slice(0, 3).forEach((f, i) => {
      insights.push({
        title: i === 0 ? "Key Feature" : i === 1 ? "Differentiator" : "Growth Lever",
        description: f,
        type: "positive",
      });
    });
  }
  if (content.industry) {
    insights.push({ title: "Market Position", description: `Operating in the ${content.industry} space`, type: "opportunity" });
  }
  return insights;
}

function deriveRoast(content: RawBlueprintContent): StartupBlueprint["roast"] {
  const items: StartupBlueprint["roast"]["items"] = [];
  if (content.problemStatement) {
    items.push({ category: "Problem Clarity", rating: 7, feedback: content.problemStatement.slice(0, 200), severity: "low" });
  } else {
    items.push({ category: "Problem Clarity", rating: 4, feedback: "Problem statement is unclear or missing", severity: "high" });
  }
  if (content.solution) {
    items.push({ category: "Solution Fit", rating: 6, feedback: content.solution.slice(0, 200), severity: "medium" });
  }
  (content.keyFeatures || []).forEach(() => {
    items.push({ category: "Feature Completeness", rating: 6, feedback: "Features address core needs", severity: "low" });
  });
  if (content.competitorAnalysis && content.competitorAnalysis.length > 0) {
    items.push({ category: "Competitive Awareness", rating: 7, feedback: `${content.competitorAnalysis.length} competitors identified`, severity: "low" });
  } else {
    items.push({ category: "Competitive Analysis", rating: 3, feedback: "No competitor analysis provided", severity: "high" });
  }
  const score = Math.round(items.reduce((s, i) => s + i.rating, 0) / items.length * 10) / 10;
  return {
    score,
    verdict: `${content.name || "The startup"} has ${score >= 6 ? "a solid foundation" : "areas that need improvement"}.`,
    items,
    risks: [
      "Customer acquisition requires significant upfront investment",
      `Market may already have established players in the ${content.industry || "target"} space`,
      "Execution risk during initial development phase",
    ],
    recommendations: [
      "Validate core assumptions with customer discovery interviews",
      "Focus on a single vertical for initial traction",
      "Develop a clear 12-month roadmap with milestones",
    ],
  };
}

function deriveVerdict(content: RawBlueprintContent): StartupBlueprint["verdict"] {
  const hasProblem = !!content.problemStatement;
  const hasSolution = !!content.solution;
  const hasCompetition = content.competitorAnalysis && content.competitorAnalysis.length > 0;
  const featureCount = content.keyFeatures?.length || 0;

  const marketScore = hasCompetition ? 60 : 45;
  const timingScore = 65;
  const competitionScore = hasCompetition ? 55 : 35;
  const defensibilityScore = featureCount > 2 ? 55 : 40;
  const founderFitScore = 65;
  const distributionScore = 50;
  const revenueScore = content.monetization ? 60 : 40;
  const compositeScore = Math.round((marketScore + timingScore + competitionScore + defensibilityScore + founderFitScore + distributionScore + revenueScore) / 7);

  const badge = compositeScore >= 70 ? "pass" as const : compositeScore >= 55 ? "conditional" as const : "needs-work" as const;

  return {
    badge,
    badgeLabel: badge === "pass" ? "Pass" : badge === "conditional" ? "Conditional Pass" : "Needs Work",
    compositeScore,
    summary: `${content.name || "The startup"} addresses ${hasProblem ? "a real problem" : "an identified need"}${hasSolution ? " with a reasonable solution" : ""}. The idea has potential but needs stronger validation.`,
    dimensions: {
      market: { score: marketScore, label: "Market Potential", description: hasCompetition ? "Market exists but competitive landscape needs analysis" : "Market potential needs further research" },
      timing: { score: timingScore, label: "Timing & Momentum", description: "Market is ready for solutions in this space" },
      competition: { score: competitionScore, label: "Competitive Position", description: hasCompetition ? "Competitive differentiation needs strengthening" : "Competitive landscape not yet analyzed" },
      defensibility: { score: defensibilityScore, label: "Defensibility", description: featureCount > 2 ? "Moderate feature-based moat" : "Limited feature differentiation" },
      founderFit: { score: founderFitScore, label: "Founder-Market Fit", description: "Founder understanding of the problem space is evident" },
      distribution: { score: distributionScore, label: "Distribution Strategy", description: "Customer acquisition channels need concrete planning" },
      revenue: { score: revenueScore, label: "Revenue Model", description: content.monetization ? "Business model is defined but needs unit economics validation" : "Revenue model not yet defined" },
    },
    strengths: [
      ...(hasProblem ? [{ dimension: "Problem Clarity", score: 70, explanation: content.problemStatement!.slice(0, 100) }] : []),
      ...(hasSolution ? [{ dimension: "Solution Approach", score: 65, explanation: content.solution!.slice(0, 100) }] : []),
      ...(featureCount > 0 ? [{ dimension: "Feature Set", score: 60, explanation: `${featureCount} features identified` }] : []),
    ],
    weaknesses: [
      ...(!hasCompetition ? [{ dimension: "Competition", score: 35, explanation: "No competitive analysis provided" }] : []),
      ...(!content.monetization ? [{ dimension: "Revenue Model", score: 40, explanation: "Revenue model not clearly defined" }] : []),
    ],
    fatalRisks: [
      hasCompetition ? "Differentiation from existing competitors needs to be established" : "Insufficient understanding of competitive landscape",
      "Customer acquisition cost may exceed projections in a competitive market",
    ],
    suggestedPivot: null,
    confidence: 60,
    confidenceLabel: "Medium Confidence",
    confidenceBreakdown: {
      dataCompleteness: hasProblem && hasSolution ? 70 : 40,
      stageMaturity: 45,
      dimensionAgreement: 65,
      industrySignal: content.industry ? 60 : 30,
    },
    improvementPaths: [
      ...(!hasCompetition ? [{ dimension: "competition", action: "Conduct detailed competitive analysis to identify positioning gaps", scoreGain: 15, risk: null as string | null, scoreLoss: null as number | null }] : []),
      ...(!content.monetization ? [{ dimension: "revenue", action: "Define pricing model and validate unit economics", scoreGain: 15, risk: "Over-reliance on a single pricing model", scoreLoss: 5 }] : []),
    ],
  };
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
    stats: deriveStats(content),
    insights: deriveInsights(content),
    website: {
      url: "",
      summary: description,
      strengths: [],
      improvements: [],
      recommendations: [],
    },
    brand: deriveBrand(content),
    logos: [],
    generationMetadata: undefined,
    icp: deriveIcp(content),
    competitors: parseCompetitors(content.competitorAnalysis),
    revenue: deriveRevenue(content),
    roadmap: parseRoadmap(content.roadmap),
    roast: deriveRoast(content),
    verdict: deriveVerdict(content),
  };
}

function tryParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
