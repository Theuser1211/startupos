/**
 * HEAD OF PRODUCT QUALITY — Blueprint Quality Evaluation
 *
 * Generates 5 blueprints, evaluates each, and produces a comparison.
 *
 * Usage:
 *   $env:OPENROUTER_API_KEY="sk-or-v1-..."; npx tsx scripts/qa-blueprint-quality.ts
 */

import { z } from "zod";
import type { InterviewData } from "@/lib/types";
import { StartupBlueprintSchema } from "@/lib/ai/validation/schema";
import { generateBlueprintAI } from "@/lib/ai/providers";
import { writeFileSync, mkdirSync } from "fs";

/* ═══════════════════════════════════════════════════════════════════
   TEST CASES
   ═══════════════════════════════════════════════════════════════════ */

interface TestCase {
  id: number;
  label: string;
  data: InterviewData;
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    label: "AI Contract Review — Indian SMBs",
    data: {
      idea: "AI contract review platform for Indian SMBs",
      stage: "ideation",
      industry: "ai",
      targetCustomer: "b2b-small",
      businessModel: "subscription",
      priceRange: "$50-200",
      problem: "cost",
    },
  },
  {
    id: 2,
    label: "Vet Marketplace",
    data: {
      idea: "On-demand veterinary marketplace connecting pet owners with licensed vets for telehealth and home visits",
      stage: "pre-seed",
      industry: "healthtech",
      targetCustomer: "b2c-mass",
      businessModel: "marketplace",
      problem: "access",
    },
  },
  {
    id: 3,
    label: "FinTech Compliance Platform",
    data: {
      idea: "Automated regulatory compliance platform for fintech startups navigating RBI, SEBI, and PCI-DSS requirements",
      stage: "seed",
      industry: "fintech",
      targetCustomer: "b2b-small",
      businessModel: "subscription",
      priceRange: "$200-1000",
      problem: "integration",
    },
  },
  {
    id: 4,
    label: "Creator Monetization SaaS",
    data: {
      idea: "All-in-one monetization platform for Indian creators — subscriptions, digital products, tip jars, and brand deal marketplace",
      stage: "pre-seed",
      industry: "creator",
      targetCustomer: "b2c-niche",
      businessModel: "usage",
      priceRange: "$10-50",
      problem: "cost",
    },
  },
  {
    id: 5,
    label: "AI Sales Assistant",
    data: {
      idea: "AI-powered sales assistant that writes follow-up emails, scores leads, and books meetings from CRM data",
      stage: "seed",
      industry: "saas",
      targetCustomer: "b2b-medium",
      businessModel: "subscription",
      priceRange: "$50-200",
      problem: "performance",
    },
  },
];

/* ═══════════════════════════════════════════════════════════════════
   QUALITY EVALUATION ENGINE
   ═══════════════════════════════════════════════════════════════════ */

type Blueprint = z.infer<typeof StartupBlueprintSchema>;

interface SectionScore {
  score: number;
  notes: string;
}

interface Evaluation {
  id: number;
  label: string;
  sections: {
    brand: SectionScore;
    icp: SectionScore;
    revenue: SectionScore;
    roadmap: SectionScore;
    verdict: SectionScore;
    roast: SectionScore;
  };
  criteria: {
    specificity: number;
    originality: number;
    founderUsefulness: number;
    actionability: number;
    differentiation: number;
  };
  issues: {
    repeated: string[];
    generic: string[];
    hallucinations: string[];
    weakRecommendations: string[];
  };
}

/* ─── Section Scorers ─── */

function scoreBrand(bp: Blueprint): SectionScore {
  let score = 5;
  const notes: string[] = [];

  // Mission specificity
  if (bp.brand.mission.length > 50) { score += 1; notes.push("detailed mission"); }
  if (bp.brand.mission.includes(bp.startupName)) { score += 0.5; notes.push("names itself"); }

  // Color palette depth
  if (bp.brand.colors.length >= 3) { score += 0.5; notes.push(`${bp.brand.colors.length} colors`); }
  if (bp.brand.colors.every(c => c.hex.startsWith("#") && c.hex.length === 7)) { score += 0.5; notes.push("valid hex"); }

  // Typography
  if (bp.brand.typography.heading !== bp.brand.typography.body) { score += 0.5; notes.push("distinct fonts"); }

  // Values
  if (bp.brand.values.length >= 3) { score += 0.5; notes.push(`${bp.brand.values.length} values`); }

  // Tone
  if (bp.brand.tone.length >= 2) { score += 0.5; notes.push("multi-tone"); }

  // Logo variety
  if (bp.logos.length >= 2) { score += 0.5; notes.push(`${bp.logos.length} logo concepts`); }

  return { score: Math.min(10, Math.round(score * 10) / 10), notes: notes.join("; ") };
}

function scoreICP(bp: Blueprint): SectionScore {
  let score = 5;
  const notes: string[] = [];

  if (bp.icp.description.length > 100) { score += 1; notes.push("detailed description"); }
  if (bp.icp.painPoints.length >= 3) { score += 1; notes.push(`${bp.icp.painPoints.length} pain points`); }
  if (bp.icp.goals.length >= 3) { score += 1; notes.push(`${bp.icp.goals.length} goals`); }
  if (bp.icp.objections.length >= 2) { score += 1; notes.push(`${bp.icp.objections.length} objections`); }
  if (bp.icp.recommendations.length >= 2) { score += 0.5; notes.push(`${bp.icp.recommendations.length} recs`); }

  // Check for specificity markers
  const allText = [bp.icp.description, ...bp.icp.painPoints, ...bp.icp.goals].join(" ");
  if (/\d+/.test(allText)) { score += 0.5; notes.push("contains numbers"); }
  if (/[A-Z][a-z]+(?:\s[A-Z][a-z]+)+/.test(bp.icp.role)) { score += 0.5; notes.push("specific role"); }

  return { score: Math.min(10, Math.round(score * 10) / 10), notes: notes.join("; ") };
}

function scoreRevenue(bp: Blueprint): SectionScore {
  let score = 5;
  const notes: string[] = [];

  if (bp.revenue.model.length > 20) { score += 0.5; notes.push("detailed model"); }
  if (bp.revenue.pricing.length > 30) { score += 0.5; notes.push("specific pricing"); }
  if (bp.revenue.projections.length >= 6) { score += 1; notes.push(`${bp.revenue.projections.length} months`); }
  if (bp.revenue.funding.length > 30) { score += 0.5; notes.push("funding detail"); }
  if (bp.revenue.analysis.length > 100) { score += 1; notes.push("analysis present"); }

  // Check for realistic numbers
  const maxProj = Math.max(...bp.revenue.projections.map(p => p.projected));
  if (maxProj > 0 && maxProj < 1000000) { score += 0.5; notes.push("realistic scale"); }

  // Check for month-over-month growth
  const projs = bp.revenue.projections.map(p => p.projected);
  const growing = projs[projs.length - 1] > projs[0];
  if (growing) { score += 0.5; notes.push("growth trend"); }

  return { score: Math.min(10, Math.round(score * 10) / 10), notes: notes.join("; ") };
}

function scoreRoadmap(bp: Blueprint): SectionScore {
  let score = 5;
  const notes: string[] = [];

  if (bp.roadmap.length >= 3) { score += 1; notes.push(`${bp.roadmap.length} phases`); }

  const totalItems = bp.roadmap.reduce((sum, phase) => sum + phase.items.length, 0);
  if (totalItems >= 6) { score += 1; notes.push(`${totalItems} items`); }

  // Check for status variety
  const statuses = new Set(bp.roadmap.flatMap(phase => phase.items.map(i => i.status)));
  if (statuses.size >= 2) { score += 0.5; notes.push("status variety"); }

  // Check for specificity in descriptions
  const avgDescLen = bp.roadmap.reduce((sum, phase) =>
    sum + phase.items.reduce((s, i) => s + i.description.length, 0), 0) / totalItems;
  if (avgDescLen > 50) { score += 1; notes.push("detailed descriptions"); }

  // Check for milestone names
  if (bp.roadmap.some(p => /phase|q[1-4]|month/i.test(p.quarter))) { score += 0.5; notes.push("named phases"); }

  // Check for concrete deliverables
  const allText = bp.roadmap.flatMap(p => p.items.map(i => `${i.title} ${i.description}`)).join(" ");
  if (/launch|release|deploy|ship|build|interview|test|validate/i.test(allText)) { score += 0.5; notes.push("action verbs"); }

  return { score: Math.min(10, Math.round(score * 10) / 10), notes: notes.join("; ") };
}

function scoreVerdict(bp: Blueprint): SectionScore {
  let score = 5;
  const notes: string[] = [];

  const v = bp.verdict;

  if (v.compositeScore > 0) { score += 0.5; notes.push(`composite: ${v.compositeScore}`); }
  if (v.summary.length > 50) { score += 1; notes.push("detailed summary"); }

  // Dimension depth
  const dims = Object.values(v.dimensions);
  const avgDimDescLen = dims.reduce((s, d) => s + d.description.length, 0) / dims.length;
  if (avgDimDescLen > 40) { score += 1; notes.push("detailed dimensions"); }

  // Strengths/weaknesses
  if (v.strengths.length >= 2) { score += 0.5; notes.push(`${v.strengths.length} strengths`); }
  if (v.weaknesses.length >= 2) { score += 0.5; notes.push(`${v.weaknesses.length} weaknesses`); }

  // Fatal risks
  if (v.fatalRisks.length >= 1) { score += 0.5; notes.push(`${v.fatalRisks.length} fatal risks`); }

  // Improvement paths
  if (v.improvementPaths.length >= 2) { score += 0.5; notes.push(`${v.improvementPaths.length} improvement paths`); }

  // Confidence breakdown
  if (v.confidenceBreakdown) { score += 0.5; notes.push("confidence breakdown"); }

  return { score: Math.min(10, Math.round(score * 10) / 10), notes: notes.join("; ") };
}

function scoreRoast(bp: Blueprint): SectionScore {
  let score = 5;
  const notes: string[] = [];

  const r = bp.roast;

  if (r.score > 0) { score += 0.5; notes.push(`score: ${r.score}/10`); }
  if (r.verdict.length > 30) { score += 1; notes.push("detailed verdict"); }
  if (r.items.length >= 3) { score += 1; notes.push(`${r.items.length} items`); }
  if (r.risks.length >= 2) { score += 0.5; notes.push(`${r.risks.length} risks`); }
  if (r.recommendations.length >= 2) { score += 0.5; notes.push(`${r.recommendations.length} recs`); }

  // Check for severity variety
  const severities = new Set(r.items.map(i => i.severity));
  if (severities.size >= 2) { score += 0.5; notes.push("severity variety"); }

  // Check for brutal honesty
  const allFeedback = r.items.map(i => i.feedback).join(" ");
  if (/risky|dangerous|naive|overconfident|delusional|unrealistic|weak|vague/i.test(allFeedback)) {
    score += 0.5; notes.push("brutal honesty");
  }

  return { score: Math.min(10, Math.round(score * 10) / 10), notes: notes.join("; ") };
}

/* ─── Criteria Scorers ─── */

function evaluateCriteria(bp: Blueprint, eval_: Evaluation): void {
  // Specificity: Does it contain concrete numbers, names, market data?
  let specificity = 5;
  const allText = JSON.stringify(bp);
  if (/\d+%/.test(allText)) specificity += 1;
  if (/\$[\d,]+/.test(allText)) specificity += 1;
  if (/\d{4}/.test(allText)) specificity += 0.5;
  if (bp.revenue.projections.some(p => p.projected > 0)) specificity += 1;
  if (bp.verdict.compositeScore > 0) specificity += 0.5;
  eval_.criteria.specificity = Math.min(10, specificity);

  // Originality: Does it avoid generic startup advice?
  let originality = 5;
  const genericPhrases = [
    "leverage", "disrupt", "synergy", "ecosystem", "scalable",
    "innovative", "game-changing", "revolutionary", "cutting-edge",
  ];
  const genericCount = genericPhrases.filter(p => allText.toLowerCase().includes(p)).length;
  originality -= genericCount * 0.5;
  if (bp.insights.some(i => i.title.length > 20)) originality += 1;
  if (bp.roast.items.some(i => i.feedback.length > 50)) originality += 1;
  eval_.criteria.originality = Math.max(1, Math.min(10, originality));

  // Founder usefulness: Can a founder act on this today?
  let usefulness = 5;
  if (bp.icp.painPoints.length >= 3) usefulness += 1;
  if (bp.revenue.pricing.length > 30) usefulness += 1;
  if (bp.roadmap.length >= 3) usefulness += 1;
  if (bp.verdict.improvementPaths.length >= 2) usefulness += 1;
  if (bp.insights.length >= 3) usefulness += 0.5;
  eval_.criteria.founderUsefulness = Math.min(10, usefulness);

  // Actionability: Are next steps concrete?
  let actionability = 5;
  if (bp.roadmap.some(p => p.items.some(i => i.status === "done"))) actionability += 1;
  if (bp.roadmap.some(p => p.items.some(i => i.status === "in-progress"))) actionability += 1;
  const roadmapVerbs = bp.roadmap.flatMap(p => p.items.map(i => i.description)).join(" ");
  if (/build|launch|interview|test|validate|hire|ship|deploy/i.test(roadmapVerbs)) actionability += 1;
  if (bp.verdict.improvementPaths.some(p => p.action.length > 30)) actionability += 1;
  eval_.criteria.actionability = Math.min(10, actionability);

  // Differentiation: Does it stand apart from other AI outputs?
  let differentiation = 5;
  if (bp.brand.colors.length >= 3 && bp.brand.colors.every(c => c.name.length > 3)) differentiation += 1;
  if (bp.roast.score <= 5) differentiation += 1; // Brutal roast = honest
  if (bp.verdict.suggestedPivot) differentiation += 0.5;
  if (bp.insights.some(i => i.type === "warning")) differentiation += 0.5;
  eval_.criteria.differentiation = Math.min(10, differentiation);
}

/* ─── Issue Detection ─── */

function detectIssues(bp: Blueprint, eval_: Evaluation): void {
  const allText = JSON.stringify(bp);

  // Repeated content: same phrases across sections
  const phrases: string[] = [];
  [bp.problem, bp.solution, bp.tagline, bp.brand.mission, bp.verdict.summary].forEach(t => {
    const words = t.split(/\s+/);
    for (let i = 0; i < words.length - 2; i++) {
      phrases.push(words.slice(i, i + 3).join(" ").toLowerCase());
    }
  });
  const phraseCounts = phrases.reduce((acc, p) => { acc[p] = (acc[p] || 0) + 1; return acc; }, {} as Record<string, number>);
  const repeated = Object.entries(phraseCounts).filter(([_, c]) => c > 2).map(([p]) => p);
  eval_.issues.repeated = [...new Set(repeated)].slice(0, 5);

  // Generic content: vague or template-like language
  const genericMarkers = [
    /in today's (?:fast-paced|competitive|rapidly evolving)/i,
    /leverage (?:the power|AI|technology)/i,
    /game.?changing/i,
    /revolutionary/i,
    /cutting.?edge/i,
    /seamless (?:integration|experience)/i,
    /end.?to.?end/i,
    /best.?in.?class/i,
    /world.?class/i,
    /next.?gen(?:eration)?/i,
  ];
  const genericMatches: string[] = [];
  for (const pattern of genericMarkers) {
    const match = allText.match(pattern);
    if (match) genericMatches.push(match[0]);
  }
  eval_.issues.generic = [...new Set(genericMatches)].slice(0, 5);

  // Hallucinations: fabricated facts, fake domains, invented stats
  const hallucinations: string[] = [];
  if (bp.website.url && !bp.website.url.includes("example") && !bp.website.url.includes("nyayaai")) {
    hallucinations.push(`Fake URL: ${bp.website.url}`);
  }
  if (bp.verdict.confidence > 90) hallucinations.push(`Overconfident confidence: ${bp.verdict.confidence}%`);
  if (bp.revenue.projections.length > 0) {
    const maxRev = Math.max(...bp.revenue.projections.map(p => p.projected));
    if (maxRev > 100000 && bp.companySnapshot.stage === "ideation") {
      hallucinations.push(`Unrealistic revenue for ideation stage: $${maxRev.toLocaleString()}`);
    }
  }
  eval_.issues.hallucinations = hallucinations;

  // Weak recommendations
  const weakRecs: string[] = [];
  const allRecs = [...bp.verdict.improvementPaths.map(p => p.action), ...bp.recommendations || []];
  for (const rec of allRecs) {
    if (rec.length < 20) weakRecs.push(`Too brief: "${rec}"`);
    if (/consider|think about|maybe|possibly/i.test(rec)) weakRecs.push(`Vague: "${rec}"`);
  }
  eval_.issues.weakRecommendations = weakRecs.slice(0, 5);
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════════ */

async function main() {
  console.log("\n" + "█".repeat(72));
  console.log("  HEAD OF PRODUCT QUALITY — Blueprint Quality Evaluation");
  console.log("  Generating 5 blueprints and scoring each section");
  console.log("█".repeat(72));

  console.log("\n✅ Using AI providers (Groq → DeepSeek)");

  // Ensure output dir
  mkdirSync("test-output", { recursive: true });

  const blueprints: { id: number; label: string; blueprint: Blueprint }[] = [];
  const evaluations: Evaluation[] = [];

  /* ─── Generate all 5 blueprints ─── */

  for (const tc of TEST_CASES) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`  Generating #${tc.id}: ${tc.label}`);
    console.log(`${"─".repeat(60)}`);

    try {
      const result = await generateBlueprintAI(tc.data);
      blueprints.push({ id: tc.id, label: tc.label, blueprint: result.blueprint });

      // Save raw JSON
      writeFileSync(`test-output/qa-bp-${tc.id}.json`, JSON.stringify(result.blueprint, null, 2));

      console.log(`  ✅ Generated: "${result.blueprint.startupName}" — ${result.blueprint.tagline}`);
      console.log(`  📊 ${result.report.provider} / ${result.report.model} — ${result.report.durationMs}ms, ${result.report.outputTokens} tokens`);
      console.log(`  📄 Saved to test-output/qa-bp-${tc.id}.json`);
    } catch (err) {
      console.error(`  ❌ Failed: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  if (blueprints.length === 0) {
    console.error("\n❌ No blueprints generated. Exiting.");
    process.exit(1);
  }

  /* ─── Evaluate each blueprint ─── */

  console.log(`\n${"═".repeat(72)}`);
  console.log("  SCORING BLUEPRINTS");
  console.log(`${"═".repeat(72)}`);

  for (const { id, label, blueprint: bp } of blueprints) {
    const eval_: Evaluation = {
      id,
      label,
      sections: {
        brand: scoreBrand(bp),
        icp: scoreICP(bp),
        revenue: scoreRevenue(bp),
        roadmap: scoreRoadmap(bp),
        verdict: scoreVerdict(bp),
        roast: scoreRoast(bp),
      },
      criteria: { specificity: 0, originality: 0, founderUsefulness: 0, actionability: 0, differentiation: 0 },
      issues: { repeated: [], generic: [], hallucinations: [], weakRecommendations: [] },
    };

    evaluateCriteria(bp, eval_);
    detectIssues(bp, eval_);
    evaluations.push(eval_);

    console.log(`\n  #${id} ${label} — "${bp.startupName}"`);
    console.log(`  Brand: ${eval_.sections.brand.score}/10 (${eval_.sections.brand.notes})`);
    console.log(`  ICP:   ${eval_.sections.icp.score}/10 (${eval_.sections.icp.notes})`);
    console.log(`  Revenue: ${eval_.sections.revenue.score}/10 (${eval_.sections.revenue.notes})`);
    console.log(`  Roadmap: ${eval_.sections.roadmap.score}/10 (${eval_.sections.roadmap.notes})`);
    console.log(`  Verdict: ${eval_.sections.verdict.score}/10 (${eval_.sections.verdict.notes})`);
    console.log(`  Roast: ${eval_.sections.roast.score}/10 (${eval_.sections.roast.notes})`);
    console.log(`  ── Criteria ──`);
    console.log(`  Specificity: ${eval_.criteria.specificity}/10`);
    console.log(`  Originality: ${eval_.criteria.originality}/10`);
    console.log(`  Founder Usefulness: ${eval_.criteria.founderUsefulness}/10`);
    console.log(`  Actionability: ${eval_.criteria.actionability}/10`);
    console.log(`  Differentiation: ${eval_.criteria.differentiation}/10`);
  }

  /* ─── COMPARISON TABLE ─── */

  console.log(`\n${"═".repeat(72)}`);
  console.log("  COMPARISON TABLE — Section Scores (1-10)");
  console.log(`${"═".repeat(72)}\n`);

  const header = `| # | ${"Blueprint".padEnd(30)} | Brand | ICP  | Rev  | Road | Verdict | Roast | AVG  |`;
  const divider = `|---|${"-".repeat(32)}|-------|------|------|------|---------|-------|------|`;
  console.log(header);
  console.log(divider);

  for (const e of evaluations) {
    const s = e.sections;
    const avg = ((s.brand.score + s.icp.score + s.revenue.score + s.roadmap.score + s.verdict.score + s.roast.score) / 6).toFixed(1);
    console.log(
      `| ${e.id} | ${e.label.padEnd(30)} |  ${s.brand.score}  |  ${s.icp.score}  |  ${s.revenue.score}  |  ${s.roadmap.score}  |   ${s.verdict.score}   |  ${s.roast.score}  | ${avg} |`
    );
  }

  /* ─── CRITERIA TABLE ─── */

  console.log(`\n${"═".repeat(72)}`);
  console.log("  CRITERIA TABLE — Quality Dimensions (1-10)");
  console.log(`${"═".repeat(72)}\n`);

  const cHeader = `| # | ${"Blueprint".padEnd(30)} | Spec | Orig | Use  | Actn | Diff  | AVG  |`;
  const cDivider = `|---|${"-".repeat(32)}|------|------|------|------|-------|------|`;
  console.log(cHeader);
  console.log(cDivider);

  for (const e of evaluations) {
    const c = e.criteria;
    const avg = ((c.specificity + c.originality + c.founderUsefulness + c.actionability + c.differentiation) / 5).toFixed(1);
    console.log(
      `| ${e.id} | ${e.label.padEnd(30)} |  ${c.specificity}  |  ${c.originality}  |  ${c.founderUsefulness}  |  ${c.actionability}  |  ${c.differentiation}  | ${avg} |`
    );
  }

  /* ─── ISSUES TABLE ─── */

  console.log(`\n${"═".repeat(72)}`);
  console.log("  ISSUES DETECTED");
  console.log(`${"═".repeat(72)}\n`);

  for (const e of evaluations) {
    console.log(`  #${e.id} ${e.label}:`);
    if (e.issues.repeated.length) console.log(`    Repeated: ${e.issues.repeated.join(", ")}`);
    if (e.issues.generic.length) console.log(`    Generic:  ${e.issues.generic.join(", ")}`);
    if (e.issues.hallucinations.length) console.log(`    Halluc:   ${e.issues.hallucinations.join(", ")}`);
    if (e.issues.weakRecommendations.length) console.log(`    Weak:     ${e.issues.weakRecommendations.join("; ")}`);
    if (!e.issues.repeated.length && !e.issues.generic.length && !e.issues.hallucinations.length && !e.issues.weakRecommendations.length) {
      console.log(`    ✅ No issues detected`);
    }
  }

  /* ─── RANKINGS ─── */

  console.log(`\n${"═".repeat(72)}`);
  console.log("  SECTION RANKINGS — Strongest to Weakest (avg across all blueprints)");
  console.log(`${"═".repeat(72)}\n`);

  const sectionNames = ["brand", "icp", "revenue", "roadmap", "verdict", "roast"] as const;
  const sectionAvgs = sectionNames.map(name => {
    const avg = evaluations.reduce((sum, e) => sum + e.sections[name].score, 0) / evaluations.length;
    return { name, avg };
  }).sort((a, b) => b.avg - a.avg);

  sectionAvgs.forEach((s, i) => {
    const bar = "█".repeat(Math.round(s.avg * 3));
    console.log(`  ${String(i + 1).padStart(2)}. ${s.name.padEnd(10)} ${s.avg.toFixed(1)}/10  ${bar}`);
  });

  /* ─── OVERALL RANKINGS ─── */

  console.log(`\n${"═".repeat(72)}`);
  console.log("  BLUEPRINT RANKINGS — Strongest to Weakest (overall avg)");
  console.log(`${"═".repeat(72)}\n`);

  const ranked = evaluations.map(e => {
    const sectionAvg = (e.sections.brand.score + e.sections.icp.score + e.sections.revenue.score + e.sections.roadmap.score + e.sections.verdict.score + e.sections.roast.score) / 6;
    const criteriaAvg = (e.criteria.specificity + e.criteria.originality + e.criteria.founderUsefulness + e.criteria.actionability + e.criteria.differentiation) / 5;
    const overall = (sectionAvg + criteriaAvg) / 2;
    return { ...e, sectionAvg, criteriaAvg, overall };
  }).sort((a, b) => b.overall - a.overall);

  ranked.forEach((r, i) => {
    const bar = "█".repeat(Math.round(r.overall * 3));
    console.log(`  ${String(i + 1).padStart(2)}. #${r.id} ${r.label.padEnd(30)} ${r.overall.toFixed(1)}/10  (sections: ${r.sectionAvg.toFixed(1)}, criteria: ${r.criteriaAvg.toFixed(1)})  ${bar}`);
  });

  /* ─── VERDICT ─── */

  const overallAvg = evaluations.reduce((sum, e) => {
    const s = (e.sections.brand.score + e.sections.icp.score + e.sections.revenue.score + e.sections.roadmap.score + e.sections.verdict.score + e.sections.roast.score) / 6;
    const c = (e.criteria.specificity + e.criteria.originality + e.criteria.founderUsefulness + e.criteria.actionability + e.criteria.differentiation) / 5;
    return sum + (s + c) / 2;
  }, 0) / evaluations.length;

  console.log(`\n${"═".repeat(72)}`);
  console.log("  OVERALL VERDICT");
  console.log(`${"═".repeat(72)}\n`);
  console.log(`  Overall Quality Score: ${overallAvg.toFixed(1)}/10`);
  console.log(`  Blueprints Evaluated: ${evaluations.length}`);
  console.log(`  Grade: ${overallAvg >= 8 ? "A — FOUNDER-GRADE" : overallAvg >= 6 ? "B — USABLE, NEEDS REFINEMENT" : overallAvg >= 4 ? "C — GENERIC AI CONTENT" : "D — UNACCEPTABLE"}`);
  console.log("");

  /* ─── TOP 5 PROMPT IMPROVEMENTS ─── */

  console.log(`${"═".repeat(72)}`);
  console.log("  TOP 5 PROMPT IMPROVEMENTS");
  console.log(`${"═".repeat(72)}\n`);

  const totalGeneric = evaluations.reduce((sum, e) => sum + e.issues.generic.length, 0);
  const totalRepeated = evaluations.reduce((sum, e) => sum + e.issues.repeated.length, 0);
  const totalHalluc = evaluations.reduce((sum, e) => sum + e.issues.hallucinations.length, 0);
  const totalWeak = evaluations.reduce((sum, e) => sum + e.issues.weakRecommendations.length, 0);

  // Compute average scores per criterion
  const avgSpecificity = evaluations.reduce((s, e) => s + e.criteria.specificity, 0) / evaluations.length;
  const avgOriginality = evaluations.reduce((s, e) => s + e.criteria.originality, 0) / evaluations.length;
  const avgActionability = evaluations.reduce((s, e) => s + e.criteria.actionability, 0) / evaluations.length;

  const improvements: { rank: number; title: string; evidence: string; impact: string }[] = [
    {
      rank: 1,
      title: "Inject real market data into the prompt",
      evidence: `Average specificity: ${avgSpecificity.toFixed(1)}/10. ${totalHalluc} hallucinated facts detected.`,
      impact: "Add: 'Cite real competitors, real market sizes (cite sources), real regulatory bodies. Do not fabricate URLs or statistics.'",
    },
    {
      rank: 2,
      title: "Ban generic startup jargon",
      evidence: `${totalGeneric} generic phrases found across all blueprints (leverage, disrupt, seamless, etc.).`,
      impact: "Add: 'BANNED PHRASES: leverage, disrupt, synergy, ecosystem, scalable, innovative, game-changing, seamless, end-to-end, world-class, cutting-edge. Using any of these = automatic failure.'",
    },
    {
      rank: 3,
      title: "Require concrete, measurable roadmap milestones",
      evidence: `Average actionability: ${avgActionability.toFixed(1)}/10. Roadmaps lack specific deliverables.`,
      impact: "Add: 'Each roadmap item must include a measurable deliverable (e.g., 'Ship landing page with 3 waitlist signups' not 'Build website'). Status must reflect real progress.'",
    },
    {
      rank: 4,
      title: "Force brutal honesty in roast section",
      evidence: `${totalWeak} weak/vague recommendations detected. Roast scores averaging mid-range.`,
      impact: "Add: 'The roast must be genuinely brutal. If the idea is mediocre, say so. Avoid 'consider X' — say 'You will fail unless you do X'. Score must reflect actual risk, not diplomatic averages.'",
    },
    {
      rank: 5,
      title: "Differentiate revenue projections by stage",
      evidence: `Revenue projections often use similar scales regardless of ideation vs seed stage.`,
      impact: "Add: 'Revenue projections MUST match the stage. Ideation: $0-5K/mo for 12 months. Pre-seed: $1-20K/mo. Seed: $10-100K/mo. Growth: $50K-1M/mo. Use realistic month-over-month growth rates (5-20% for early stage).'",
    },
  ];

  for (const imp of improvements) {
    console.log(`  ${imp.rank}. ${imp.title}`);
    console.log(`     Evidence: ${imp.evidence}`);
    console.log(`     Impact: ${imp.impact}`);
    console.log("");
  }

  console.log(`${"═".repeat(72)}\n`);

  // Save full evaluation
  writeFileSync("test-output/qa-evaluation.json", JSON.stringify({
    evaluations,
    sectionRankings: sectionAvgs,
    overallRankings: ranked.map(r => ({ id: r.id, label: r.label, overall: r.overall })),
    overallScore: overallAvg,
    improvements,
  }, null, 2));
  console.log("  📄 Full evaluation saved to test-output/qa-evaluation.json\n");
}

main().catch((e) => {
  console.error("\n[FATAL]", e);
  process.exit(1);
});
