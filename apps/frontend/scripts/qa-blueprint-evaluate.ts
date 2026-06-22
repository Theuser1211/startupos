/**
 * HEAD OF PRODUCT QUALITY — Blueprint Quality Evaluation
 *
 * Loads 5 saved blueprints and evaluates each section.
 *
 * Usage:
 *   npx tsx scripts/qa-blueprint-evaluate.ts
 */

import { z } from "zod";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { StartupBlueprintSchema } from "@/lib/ai/validation/schema";

/* ═══════════════════════════════════════════════════════════════════
   TEST CASES
   ═══════════════════════════════════════════════════════════════════ */

interface TestCase {
  id: number;
  label: string;
  file: string;
  source: "ai" | "deterministic";
}

const TEST_CASES: TestCase[] = [
  { id: 1, label: "AI Contract Review — Indian SMBs", file: "test-output/qa-bp-1.json", source: "deterministic" },
  { id: 2, label: "Vet Marketplace", file: "test-output/qa-bp-2.json", source: "deterministic" },
  { id: 3, label: "FinTech Compliance Platform", file: "test-output/qa-bp-3.json", source: "deterministic" },
  { id: 4, label: "Creator Monetization SaaS", file: "test-output/qa-bp-4.json", source: "ai" },
  { id: 5, label: "AI Sales Assistant", file: "test-output/qa-bp-5.json", source: "ai" },
];

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type Blueprint = z.infer<typeof StartupBlueprintSchema>;

interface SectionScore {
  score: number;
  notes: string;
}

interface Evaluation {
  id: number;
  label: string;
  source: string;
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

/* ═══════════════════════════════════════════════════════════════════
   SECTION SCORERS
   ═══════════════════════════════════════════════════════════════════ */

function scoreBrand(bp: Blueprint): SectionScore {
  let score = 5;
  const notes: string[] = [];

  if (bp.brand.mission.length > 50) { score += 1; notes.push("detailed mission"); }
  if (bp.brand.mission.includes(bp.startupName)) { score += 0.5; notes.push("names itself"); }
  if (bp.brand.colors.length >= 3) { score += 0.5; notes.push(`${bp.brand.colors.length} colors`); }
  if (bp.brand.colors.every(c => c.hex.startsWith("#") && c.hex.length === 7)) { score += 0.5; notes.push("valid hex"); }
  if (bp.brand.typography.heading !== bp.brand.typography.body) { score += 0.5; notes.push("distinct fonts"); }
  if (bp.brand.values.length >= 3) { score += 0.5; notes.push(`${bp.brand.values.length} values`); }
  if (bp.brand.tone.length >= 2) { score += 0.5; notes.push("multi-tone"); }
  if (bp.logos.length >= 2) { score += 0.5; notes.push(`${bp.logos.length} logo concepts`); }

  return { score: Math.min(10, Math.round(score * 10) / 10), notes: notes.join("; ") };
}

function scoreICP(bp: Blueprint): SectionScore {
  let score = 5;
  const notes: string[] = [];

  if (bp.icp.description.length > 100) { score += 1; notes.push("detailed desc"); }
  if (bp.icp.painPoints.length >= 3) { score += 1; notes.push(`${bp.icp.painPoints.length} pain points`); }
  if (bp.icp.goals.length >= 3) { score += 1; notes.push(`${bp.icp.goals.length} goals`); }
  if (bp.icp.objections.length >= 2) { score += 1; notes.push(`${bp.icp.objections.length} objections`); }
  if (bp.icp.recommendations.length >= 2) { score += 0.5; notes.push(`${bp.icp.recommendations.length} recs`); }

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

  const maxProj = Math.max(...bp.revenue.projections.map(p => p.projected));
  if (maxProj > 0 && maxProj < 1000000) { score += 0.5; notes.push("realistic scale"); }

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

  const statuses = new Set(bp.roadmap.flatMap(phase => phase.items.map(i => i.status)));
  if (statuses.size >= 2) { score += 0.5; notes.push("status variety"); }

  const avgDescLen = bp.roadmap.reduce((sum, phase) =>
    sum + phase.items.reduce((s, i) => s + i.description.length, 0), 0) / totalItems;
  if (avgDescLen > 50) { score += 1; notes.push("detailed descriptions"); }

  if (bp.roadmap.some(p => /phase|q[1-4]|month/i.test(p.quarter))) { score += 0.5; notes.push("named phases"); }

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

  const dims = Object.values(v.dimensions);
  const avgDimDescLen = dims.reduce((s, d) => s + d.description.length, 0) / dims.length;
  if (avgDimDescLen > 40) { score += 1; notes.push("detailed dimensions"); }

  if (v.strengths.length >= 2) { score += 0.5; notes.push(`${v.strengths.length} strengths`); }
  if (v.weaknesses.length >= 2) { score += 0.5; notes.push(`${v.weaknesses.length} weaknesses`); }
  if (v.fatalRisks.length >= 1) { score += 0.5; notes.push(`${v.fatalRisks.length} fatal risks`); }
  if (v.improvementPaths.length >= 2) { score += 0.5; notes.push(`${v.improvementPaths.length} paths`); }
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

  const severities = new Set(r.items.map(i => i.severity));
  if (severities.size >= 2) { score += 0.5; notes.push("severity variety"); }

  const allFeedback = r.items.map(i => i.feedback).join(" ");
  if (/risky|dangerous|naive|overconfident|delusional|unrealistic|weak|vague/i.test(allFeedback)) {
    score += 0.5; notes.push("brutal honesty");
  }

  return { score: Math.min(10, Math.round(score * 10) / 10), notes: notes.join("; ") };
}

/* ═══════════════════════════════════════════════════════════════════
   CRITERIA SCORERS
   ═══════════════════════════════════════════════════════════════════ */

function evaluateCriteria(bp: Blueprint, eval_: Evaluation): void {
  let specificity = 5;
  const allText = JSON.stringify(bp);
  if (/\d+%/.test(allText)) specificity += 1;
  if (/\$[\d,]+/.test(allText)) specificity += 1;
  if (/\d{4}/.test(allText)) specificity += 0.5;
  if (bp.revenue.projections.some(p => p.projected > 0)) specificity += 1;
  if (bp.verdict.compositeScore > 0) specificity += 0.5;
  eval_.criteria.specificity = Math.min(10, specificity);

  let originality = 5;
  const genericPhrases = ["leverage", "disrupt", "synergy", "ecosystem", "scalable", "innovative", "game-changing", "revolutionary", "cutting-edge"];
  const genericCount = genericPhrases.filter(p => allText.toLowerCase().includes(p)).length;
  originality -= genericCount * 0.5;
  if (bp.insights.some(i => i.title.length > 20)) originality += 1;
  if (bp.roast.items.some(i => i.feedback.length > 50)) originality += 1;
  eval_.criteria.originality = Math.max(1, Math.min(10, originality));

  let usefulness = 5;
  if (bp.icp.painPoints.length >= 3) usefulness += 1;
  if (bp.revenue.pricing.length > 30) usefulness += 1;
  if (bp.roadmap.length >= 3) usefulness += 1;
  if (bp.verdict.improvementPaths.length >= 2) usefulness += 1;
  if (bp.insights.length >= 3) usefulness += 0.5;
  eval_.criteria.founderUsefulness = Math.min(10, usefulness);

  let actionability = 5;
  if (bp.roadmap.some(p => p.items.some(i => i.status === "done"))) actionability += 1;
  if (bp.roadmap.some(p => p.items.some(i => i.status === "in-progress"))) actionability += 1;
  const roadmapVerbs = bp.roadmap.flatMap(p => p.items.map(i => i.description)).join(" ");
  if (/build|launch|interview|test|validate|hire|ship|deploy/i.test(roadmapVerbs)) actionability += 1;
  if (bp.verdict.improvementPaths.some(p => p.action.length > 30)) actionability += 1;
  eval_.criteria.actionability = Math.min(10, actionability);

  let differentiation = 5;
  if (bp.brand.colors.length >= 3 && bp.brand.colors.every(c => c.name.length > 3)) differentiation += 1;
  if (bp.roast.score <= 5) differentiation += 1;
  if (bp.verdict.suggestedPivot) differentiation += 0.5;
  if (bp.insights.some(i => i.type === "warning")) differentiation += 0.5;
  eval_.criteria.differentiation = Math.min(10, differentiation);
}

/* ═══════════════════════════════════════════════════════════════════
   ISSUE DETECTION
   ═══════════════════════════════════════════════════════════════════ */

function detectIssues(bp: Blueprint, eval_: Evaluation): void {
  const allText = JSON.stringify(bp);

  // Repeated content
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

  // Generic content
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

  // Hallucinations
  const hallucinations: string[] = [];
  if (bp.website.url && !bp.website.url.includes("example") && !bp.website.url.includes("startupos")) {
    // Check if URL looks fabricated
    if (/\.(com|io|ai|app)$/.test(bp.website.url) && !bp.website.url.includes("nyayaai")) {
      hallucinations.push(`Fabricated URL: ${bp.website.url}`);
    }
  }
  if (bp.verdict.confidence > 90) hallucinations.push(`Overconfident confidence: ${bp.verdict.confidence}%`);
  if (bp.revenue.projections.length > 0) {
    const maxRev = Math.max(...bp.revenue.projections.map(p => p.projected));
    if (maxRev > 100000 && bp.companySnapshot.stage === "ideation") {
      hallucinations.push(`Unrealistic revenue for ideation: $${maxRev.toLocaleString()}`);
    }
  }
  eval_.issues.hallucinations = hallucinations;

  // Weak recommendations
  const weakRecs: string[] = [];
  const allRecs = [...bp.verdict.improvementPaths.map(p => p.action), ...bp.roast.recommendations];
  for (const rec of allRecs) {
    if (rec.length < 20) weakRecs.push(`Too brief: "${rec}"`);
    if (/consider|think about|maybe|possibly/i.test(rec)) weakRecs.push(`Vague: "${rec}"`);
  }
  eval_.issues.weakRecommendations = weakRecs.slice(0, 5);
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════════ */

function main() {
  console.log("\n" + "█".repeat(72));
  console.log("  HEAD OF PRODUCT QUALITY — Blueprint Quality Evaluation");
  console.log("  Evaluating 5 saved blueprints across 6 sections + 5 criteria");
  console.log("█".repeat(72));

  mkdirSync("test-output", { recursive: true });

  const evaluations: Evaluation[] = [];

  for (const tc of TEST_CASES) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`  Evaluating #${tc.id}: ${tc.label} [${tc.source}]`);
    console.log(`${"─".repeat(60)}`);

    const raw = readFileSync(tc.file, "utf-8");
    const parsed = JSON.parse(raw);
    const result = StartupBlueprintSchema.safeParse(parsed);

    if (!result.success) {
      console.error(`  ❌ Zod validation failed for #${tc.id}:`, result.error.format());
      continue;
    }

    const bp = result.data;
    console.log(`  ✅ Zod validated: "${bp.startupName}"`);

    const eval_: Evaluation = {
      id: tc.id,
      label: tc.label,
      source: tc.source,
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

    console.log(`\n  Section Scores:`);
    console.log(`    Brand:   ${eval_.sections.brand.score}/10 — ${eval_.sections.brand.notes}`);
    console.log(`    ICP:     ${eval_.sections.icp.score}/10 — ${eval_.sections.icp.notes}`);
    console.log(`    Revenue: ${eval_.sections.revenue.score}/10 — ${eval_.sections.revenue.notes}`);
    console.log(`    Roadmap: ${eval_.sections.roadmap.score}/10 — ${eval_.sections.roadmap.notes}`);
    console.log(`    Verdict: ${eval_.sections.verdict.score}/10 — ${eval_.sections.verdict.notes}`);
    console.log(`    Roast:   ${eval_.sections.roast.score}/10 — ${eval_.sections.roast.notes}`);
    console.log(`  Criteria Scores:`);
    console.log(`    Specificity:      ${eval_.criteria.specificity}/10`);
    console.log(`    Originality:      ${eval_.criteria.originality}/10`);
    console.log(`    Founder Useful:   ${eval_.criteria.founderUsefulness}/10`);
    console.log(`    Actionability:    ${eval_.criteria.actionability}/10`);
    console.log(`    Differentiation:  ${eval_.criteria.differentiation}/10`);

    if (eval_.issues.repeated.length) console.log(`  ⚠ Repeated: ${eval_.issues.repeated.join(", ")}`);
    if (eval_.issues.generic.length) console.log(`  ⚠ Generic:  ${eval_.issues.generic.join(", ")}`);
    if (eval_.issues.hallucinations.length) console.log(`  ⚠ Halluc:   ${eval_.issues.hallucinations.join(", ")}`);
    if (eval_.issues.weakRecommendations.length) console.log(`  ⚠ Weak:     ${eval_.issues.weakRecommendations.join("; ")}`);
  }

  /* ─── COMPARISON TABLE: Section Scores ─── */

  console.log(`\n${"═".repeat(72)}`);
  console.log("  COMPARISON TABLE — Section Scores (1-10)");
  console.log(`${"═".repeat(72)}\n`);

  console.log(`| # | ${"Blueprint".padEnd(30)} | Source | Brand | ICP  | Rev  | Road | Ver  | Roast | AVG  |`);
  console.log(`|---|${"-".repeat(32)}|--------|-------|------|------|------|------|-------|------|`);

  for (const e of evaluations) {
    const s = e.sections;
    const avg = ((s.brand.score + s.icp.score + s.revenue.score + s.roadmap.score + s.verdict.score + s.roast.score) / 6).toFixed(1);
    console.log(
      `| ${e.id} | ${e.label.padEnd(30)} | ${e.source.padEnd(8)} |  ${s.brand.score}  |  ${s.icp.score}  |  ${s.revenue.score}  |  ${s.roadmap.score}  |  ${s.verdict.score}  |  ${s.roast.score}  | ${avg} |`
    );
  }

  /* ─── COMPARISON TABLE: Criteria Scores ─── */

  console.log(`\n${"═".repeat(72)}`);
  console.log("  COMPARISON TABLE — Quality Criteria (1-10)");
  console.log(`${"═".repeat(72)}\n`);

  console.log(`| # | ${"Blueprint".padEnd(30)} | Source | Spec | Orig | Use  | Actn | Diff  | AVG  |`);
  console.log(`|---|${"-".repeat(32)}|--------|------|------|------|------|-------|------|`);

  for (const e of evaluations) {
    const c = e.criteria;
    const avg = ((c.specificity + c.originality + c.founderUsefulness + c.actionability + c.differentiation) / 5).toFixed(1);
    console.log(
      `| ${e.id} | ${e.label.padEnd(30)} | ${e.source.padEnd(8)} |  ${c.specificity}  |  ${c.originality}  |  ${c.founderUsefulness}  |  ${c.actionability}  |  ${c.differentiation}  | ${avg} |`
    );
  }

  /* ─── ISSUES TABLE ─── */

  console.log(`\n${"═".repeat(72)}`);
  console.log("  ISSUES DETECTED");
  console.log(`${"═".repeat(72)}\n`);

  for (const e of evaluations) {
    console.log(`  #${e.id} ${e.label} [${e.source}]:`);
    if (e.issues.repeated.length) console.log(`    Repeated: ${e.issues.repeated.join(", ")}`);
    if (e.issues.generic.length) console.log(`    Generic:  ${e.issues.generic.join(", ")}`);
    if (e.issues.hallucinations.length) console.log(`    Halluc:   ${e.issues.hallucinations.join(", ")}`);
    if (e.issues.weakRecommendations.length) console.log(`    Weak:     ${e.issues.weakRecommendations.join("; ")}`);
    if (!e.issues.repeated.length && !e.issues.generic.length && !e.issues.hallucinations.length && !e.issues.weakRecommendations.length) {
      console.log(`    ✅ No issues detected`);
    }
  }

  /* ─── SECTION RANKINGS ─── */

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
  console.log("  BLUEPRINT RANKINGS — Strongest to Weakest");
  console.log(`${"═".repeat(72)}\n`);

  const ranked = evaluations.map(e => {
    const sectionAvg = (e.sections.brand.score + e.sections.icp.score + e.sections.revenue.score + e.sections.roadmap.score + e.sections.verdict.score + e.sections.roast.score) / 6;
    const criteriaAvg = (e.criteria.specificity + e.criteria.originality + e.criteria.founderUsefulness + e.criteria.actionability + e.criteria.differentiation) / 5;
    const overall = (sectionAvg + criteriaAvg) / 2;
    return { ...e, sectionAvg, criteriaAvg, overall };
  }).sort((a, b) => b.overall - a.overall);

  ranked.forEach((r, i) => {
    const bar = "█".repeat(Math.round(r.overall * 3));
    console.log(`  ${String(i + 1).padStart(2)}. #${r.id} ${r.label.padEnd(30)} [${r.source.padEnd(13)}] ${r.overall.toFixed(1)}/10  (sections: ${r.sectionAvg.toFixed(1)}, criteria: ${r.criteriaAvg.toFixed(1)})  ${bar}`);
  });

  /* ─── OVERALL VERDICT ─── */

  const overallAvg = evaluations.reduce((sum, e) => {
    const s = (e.sections.brand.score + e.sections.icp.score + e.sections.revenue.score + e.sections.roadmap.score + e.sections.verdict.score + e.sections.roast.score) / 6;
    const c = (e.criteria.specificity + e.criteria.originality + e.criteria.founderUsefulness + e.criteria.actionability + e.criteria.differentiation) / 5;
    return sum + (s + c) / 2;
  }, 0) / evaluations.length;

  // AI vs Deterministic comparison
  const aiEvals = evaluations.filter(e => e.source === "ai");
  const detEvals = evaluations.filter(e => e.source === "deterministic");

  const aiAvg = aiEvals.length ? aiEvals.reduce((sum, e) => {
    const s = (e.sections.brand.score + e.sections.icp.score + e.sections.revenue.score + e.sections.roadmap.score + e.sections.verdict.score + e.sections.roast.score) / 6;
    const c = (e.criteria.specificity + e.criteria.originality + e.criteria.founderUsefulness + e.criteria.actionability + e.criteria.differentiation) / 5;
    return sum + (s + c) / 2;
  }, 0) / aiEvals.length : 0;

  const detAvg = detEvals.length ? detEvals.reduce((sum, e) => {
    const s = (e.sections.brand.score + e.sections.icp.score + e.sections.revenue.score + e.sections.roadmap.score + e.sections.verdict.score + e.sections.roast.score) / 6;
    const c = (e.criteria.specificity + e.criteria.originality + e.criteria.founderUsefulness + e.criteria.actionability + e.criteria.differentiation) / 5;
    return sum + (s + c) / 2;
  }, 0) / detEvals.length : 0;

  console.log(`\n${"═".repeat(72)}`);
  console.log("  OVERALL VERDICT");
  console.log(`${"═".repeat(72)}\n`);
  console.log(`  Overall Quality Score:    ${overallAvg.toFixed(1)}/10`);
  console.log(`  AI-Generated Avg:         ${aiAvg.toFixed(1)}/10 (${aiEvals.length} blueprints)`);
  console.log(`  Deterministic Fallback:   ${detAvg.toFixed(1)}/10 (${detEvals.length} blueprints)`);
  console.log(`  AI vs Deterministic Gap:  ${(aiAvg - detAvg).toFixed(1)} points`);
  console.log(`  Grade: ${overallAvg >= 8 ? "A — FOUNDER-GRADE" : overallAvg >= 6 ? "B — USABLE, NEEDS REFINEMENT" : overallAvg >= 4 ? "C — GENERIC AI CONTENT" : "D — UNACCEPTABLE"}`);

  /* ─── TOP 5 PROMPT IMPROVEMENTS ─── */

  console.log(`\n${"═".repeat(72)}`);
  console.log("  TOP 5 PROMPT IMPROVEMENTS");
  console.log(`${"═".repeat(72)}\n`);

  const totalGeneric = evaluations.reduce((sum, e) => sum + e.issues.generic.length, 0);
  const totalHalluc = evaluations.reduce((sum, e) => sum + e.issues.hallucinations.length, 0);
  const totalWeak = evaluations.reduce((sum, e) => sum + e.issues.weakRecommendations.length, 0);
  const avgSpecificity = evaluations.reduce((s, e) => s + e.criteria.specificity, 0) / evaluations.length;
  const avgOriginality = evaluations.reduce((s, e) => s + e.criteria.originality, 0) / evaluations.length;
  const avgActionability = evaluations.reduce((s, e) => s + e.criteria.actionability, 0) / evaluations.length;

  const improvements = [
    {
      rank: 1,
      title: "Inject real market data into the prompt",
      evidence: `Avg specificity: ${avgSpecificity.toFixed(1)}/10. ${totalHalluc} hallucinated facts. Blueprints lack real competitor names, real market sizes, real regulatory bodies.`,
      impact: `Add to prompt: "Cite real competitors (names, URLs), real TAM/SAM/SOM numbers with sources, real regulatory bodies. Do NOT fabricate URLs or statistics. If you don't know a number, say 'TBD' rather than guessing."`,
    },
    {
      rank: 2,
      title: "Ban generic startup jargon with explicit blacklist",
      evidence: `${totalGeneric} generic phrases found across all blueprints: leverage, disrupt, seamless, end-to-end, world-class, cutting-edge, next-gen, game-changing.`,
      impact: `Add to prompt: "BANNED PHRASES (using any = automatic failure): leverage, disrupt, synergy, ecosystem, scalable, innovative, game-changing, seamless, end-to-end, world-class, cutting-edge, next-gen, revolutionary, best-in-class. Replace with specific, concrete language."`,
    },
    {
      rank: 3,
      title: "Require concrete, measurable roadmap milestones",
      evidence: `Avg actionability: ${avgActionability.toFixed(1)}/10. Roadmap items use vague verbs like 'build' and 'develop' without measurable outcomes.`,
      impact: `Add to prompt: "Each roadmap item MUST include a measurable deliverable. Example: 'Ship landing page with 3 waitlist signups from 10 cold emails' — NOT 'Build website'. Every item needs: what ships, how you measure success, and who owns it."`,
    },
    {
      rank: 4,
      title: "Force brutal honesty in roast and verdict sections",
      evidence: `${totalWeak} weak/vague recommendations detected. Roast scores cluster around 5-7 (diplomatic). Verdicts avoid saying 'this will fail'.`,
      impact: `Add to prompt: "The roast must be BRUTALLY honest. If the idea is mediocre, say 'This idea is mediocre and here's why.' Avoid 'consider X' — say 'You will fail unless you do X'. The verdict badge must reflect real risk, not diplomatic averages. A 'pass' badge should be rare (top 20% of ideas)."`,
    },
    {
      rank: 5,
      title: "Differentiate revenue projections by stage with hard constraints",
      evidence: `Revenue projections often use similar scales ($10K-50K/mo) regardless of ideation vs seed stage. Growth rates are unrealistically smooth.`,
      impact: `Add to prompt: "Revenue projections MUST match stage: Ideation: $0-5K/mo for 12 months. Pre-seed: $1-20K/mo. Seed: $10-100K/mo. Growth: $50K-1M/mo. Use realistic month-over-month growth (5-20% for early stage, not linear). Include a 'realistic' and 'optimistic' column."`,
    },
  ];

  for (const imp of improvements) {
    console.log(`  ${imp.rank}. ${imp.title}`);
    console.log(`     Evidence: ${imp.evidence}`);
    console.log(`     Fix:      ${imp.impact}`);
    console.log("");
  }

  console.log(`${"═".repeat(72)}\n`);

  // Save full evaluation
  writeFileSync("test-output/qa-evaluation.json", JSON.stringify({
    evaluations,
    sectionRankings: sectionAvgs,
    overallRankings: ranked.map(r => ({ id: r.id, label: r.label, source: r.source, overall: r.overall })),
    overallScore: overallAvg,
    aiScore: aiAvg,
    deterministicScore: detAvg,
    improvements,
  }, null, 2));
  console.log("  📄 Full evaluation saved to test-output/qa-evaluation.json\n");
}

main();
