import type { InterviewData, StartupBlueprint, Startup } from "@/lib/types";
import { normalizeBlueprint } from "./blueprint";
import {
  STAGE_LABELS, INDUSTRY_LABELS, CUSTOMER_LABELS,
  BUSINESS_MODEL_LABELS, PRICE_RANGE_LABELS, PROBLEM_LABELS,
} from "@/lib/types";

const GUEST_STARTUP_KEY = "guestStartupId";
const GUEST_MODE_KEY = "guestMode";

export function generateId(): string {
  return `guest-${crypto.randomUUID()}`;
}

export function isGuest(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GUEST_MODE_KEY) === "true";
}

export function saveGuestStartup(startupId: string, data: InterviewData, companyName: string): void {
  const industry = data.industry === "other" && data.industryOther
    ? data.industryOther
    : (INDUSTRY_LABELS[data.industry] || data.industry);

  const industryLabel = INDUSTRY_LABELS[data.industry] || data.industry || "technology";
  const customerLabel = CUSTOMER_LABELS[data.targetCustomer] || data.targetCustomer || "startups";
  const problemLabel = data.problem === "other" && data.problemOther
    ? data.problemOther
    : (PROBLEM_LABELS[data.problem] || data.problem || "efficiency");

  const brandValues = [];
  if (data.industry === "ai" || data.industry === "saas" || data.industry === "developer-tools") brandValues.push("Innovation");
  else brandValues.push("Quality");
  if (data.targetCustomer === "b2b-small" || data.targetCustomer === "b2b-enterprise") brandValues.push("Trust", "Reliability");
  else if (data.targetCustomer === "b2c-mass" || data.targetCustomer === "b2c-niche") brandValues.push("Simplicity", "Accessibility");
  else brandValues.push("Community", "Transparency");
  if (data.problem === "cost" || data.problem === "time") brandValues.push("Efficiency");
  if (data.problem === "quality") brandValues.push("Excellence");
  brandValues.push("Customer-Centric");

  const brandColors = [];
  if (data.industry === "fintech" || data.industry === "health") {
    brandColors.push({ name: "Primary", hex: "#2563EB" }, { name: "Secondary", hex: "#7C3AED" }, { name: "Accent", hex: "#10B981" });
  } else if (data.industry === "ai" || data.industry === "developer-tools" || data.industry === "saas") {
    brandColors.push({ name: "Primary", hex: "#6C5CE7" }, { name: "Secondary", hex: "#00B894" }, { name: "Accent", hex: "#FDCB6E" });
  } else {
    brandColors.push({ name: "Primary", hex: "#E17055" }, { name: "Secondary", hex: "#00CEC9" }, { name: "Accent", hex: "#6C5CE7" });
  }
  brandColors.push({ name: "Neutral", hex: "#636E72" });

  const rawBlueprint = {
    name: companyName,
    description: data.idea || "",
    industry,
    problemStatement: problemLabel,
    solution: data.idea || "",
    targetAudience: customerLabel,
    keyFeatures: [
      "AI-powered idea validation",
      "Automated market analysis",
      "Smart competitor tracking",
      "Brand asset generation",
    ],
    monetization: data.priceRange
      ? `${BUSINESS_MODEL_LABELS[data.businessModel] || data.businessModel} — ${PRICE_RANGE_LABELS[data.priceRange] || data.priceRange}`
      : (BUSINESS_MODEL_LABELS[data.businessModel] || data.businessModel),
    techStack: ["React", "Node.js", "AI/ML"],
    competitorAnalysis: [],
    roadmap: [],
    brand: {
      mission: `Empower ${customerLabel} to solve ${problemLabel} with ${companyName}`,
      values: brandValues.slice(0, 5),
      tone: ["Professional", "Approachable", "Confident"],
      colors: brandColors,
      typography: { heading: "Inter", body: "Inter" },
    },
  };

  const startupData: Startup = {
    id: startupId,
    name: companyName,
    description: data.idea || null,
    logo: null,
    industry: data.industry || "other",
    stage: data.stage || "ideation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(GUEST_STARTUP_KEY, startupId);
    localStorage.setItem(GUEST_MODE_KEY, "true");
    localStorage.setItem(`guest_startup_${startupId}`, JSON.stringify(startupData));
    localStorage.setItem(`guest_blueprint_${startupId}`, JSON.stringify(rawBlueprint));
    localStorage.setItem("startupos-founder", JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function getGuestStartup(startupId: string): Startup | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(`guest_startup_${startupId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function getGuestBlueprint(startupId: string): StartupBlueprint | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(`guest_blueprint_${startupId}`);
    if (!data) return null;
    const parsed = JSON.parse(data);
    const normalized = normalizeBlueprint({ id: startupId, content: parsed, createdAt: new Date().toISOString(), startupId });
    return normalized;
  } catch {
    return null;
  }
}

export function getGuestStartupId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(GUEST_STARTUP_KEY);
  } catch {
    return null;
  }
}

export function clearGuestData(startupId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const sid = startupId || localStorage.getItem(GUEST_STARTUP_KEY);
    if (sid) {
      localStorage.removeItem(`guest_startup_${sid}`);
      localStorage.removeItem(`guest_blueprint_${sid}`);
    }
    localStorage.removeItem(GUEST_STARTUP_KEY);
    localStorage.removeItem(GUEST_MODE_KEY);
  } catch {
    // ignore
  }
}
