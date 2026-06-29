"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Award, ShieldCheck, ShieldAlert, TrendingUp, TrendingDown,
  Lightbulb, Crosshair, AlertTriangle, MoveRight, Sparkles, Scale,
  Swords, XCircle, BarChart3, Clock, Users, Globe, DollarSign, Zap,
  HelpCircle,
} from "lucide-react";
import type { StartupBlueprint } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const badgeConfig = {
  pass: {
    icon: Award, label: "PASS", gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/30", bg: "bg-emerald-500/10",
    border: "border-emerald-500/30", text: "text-emerald-400",
    ring: "ring-emerald-500/30",
    description: "Your startup has demonstrated strong fundamentals and a viable path to success.",
  },
  conditional: {
    icon: ShieldCheck, label: "CONDITIONAL PASS", gradient: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/30", bg: "bg-blue-500/10",
    border: "border-blue-500/30", text: "text-blue-400",
    ring: "ring-blue-500/30",
    description: "Your startup has potential, but key areas need attention before scaling.",
  },
  "needs-work": {
    icon: ShieldAlert, label: "NEEDS WORK", gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/30", bg: "bg-amber-500/10",
    border: "border-amber-500/30", text: "text-amber-400",
    ring: "ring-amber-500/30",
    description: "Significant gaps exist in your current strategy. Address these before seeking investment.",
  },
  fail: {
    icon: XCircle, label: "FAIL", gradient: "from-red-500 to-rose-600",
    glow: "shadow-red-500/30", bg: "bg-red-500/10",
    border: "border-red-500/30", text: "text-red-400",
    ring: "ring-red-500/30",
    description: "Critical issues threaten your startup's viability. A fundamental pivot may be necessary.",
  },
};

const dimensionMeta: Record<string, { icon: typeof Award; label: string }> = {
  market: { icon: Globe, label: "Market" },
  timing: { icon: Clock, label: "Timing" },
  competition: { icon: Swords, label: "Competition" },
  defensibility: { icon: ShieldCheck, label: "Defensibility" },
  founderFit: { icon: Users, label: "Founder Fit" },
  distribution: { icon: Zap, label: "Distribution" },
  revenue: { icon: DollarSign, label: "Revenue" },
};

function ScoreGauge({ value, label, icon: Icon }: { value: number; label: string; icon: typeof Award }) {
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <motion.circle
            cx="55" cy="55" r="48" fill="none"
            stroke={`url(#gauge-${label.replace(/\s+/g, "-")})`}
            strokeWidth="6" strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            style={{ strokeDasharray: circumference }}
          />
          <defs>
            <linearGradient id={`gauge-${label.replace(/\s+/g, "-")}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={value >= 70 ? "#10B981" : value >= 50 ? "#F59E0B" : "#EF4444"} />
              <stop offset="100%" stopColor={value >= 70 ? "#059669" : value >= 50 ? "#D97706" : "#DC2626"} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`h-5 w-5 ${value >= 70 ? "text-emerald-400" : value >= 50 ? "text-amber-400" : "text-red-400"}`} />
          <span className={`text-xl font-bold tabular-nums ${value >= 70 ? "text-emerald-400" : value >= 50 ? "text-amber-400" : "text-red-400"}`}>
            {value}
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

function DimensionCard({ dimKey, score, description }: { dimKey: string; score: number; description: string }) {
  const meta = dimensionMeta[dimKey] || { icon: HelpCircle, label: dimKey };
  const Icon = meta.icon;
  const color = score >= 70 ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
    : score >= 50 ? "text-amber-400 border-amber-500/20 bg-amber-500/5"
    : "text-red-400 border-red-500/20 bg-red-500/5";

  return (
    <Card className={` border ${color} hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded ${
            score >= 70 ? "bg-emerald-500/10" : score >= 50 ? "bg-amber-500/10" : "bg-red-500/10"
          }`}>
            <Icon className={`h-4 w-4 ${score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-semibold">{meta.label}</span>
              <span className={`text-sm font-bold font-mono tabular-nums ${score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>{score}</span>
            </div>
            <div className="h-1 rounded-full bg-white/5 mt-2 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function ConfidenceFactor({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="mono-label text-xs text-muted-foreground w-40 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${value >= 80 ? "bg-emerald-500" : value >= 55 ? "bg-amber-500" : "bg-red-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums w-8 text-right ${value >= 80 ? "text-emerald-400" : value >= 55 ? "text-amber-400" : "text-red-400"}`}>{value}</span>
    </div>
  );
}

function ImprovementCard({ dimension, action, gain, risk, loss }: {
  dimension: string; action: string; gain: number; risk: string | null; loss: number | null;
}) {
  const meta = dimensionMeta[dimension] || { icon: HelpCircle, label: dimension };
  const Icon = meta.icon;

  return (
    <Card className=" hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 border border-primary/20">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="mono-label text-xs text-muted-foreground">{meta.label}</span>
        </div>
        <div className="flex items-start gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-mono text-foreground/80">{action}</p>
            <span className="text-[11px] text-emerald-400/80 font-mono">+{gain} pts</span>
          </div>
        </div>
        {risk && loss && (
          <div className="flex items-start gap-2 pt-2 border-t border-primary/10">
            <TrendingDown className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{risk}</p>
              <span className="text-[11px] text-red-400/80 font-medium">-{loss} pts</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TraitCard({ dimension, score, explanation, positive }: {
  dimension: string; score: number; explanation: string; positive: boolean;
}) {
  const meta = dimensionMeta[dimension] || { icon: HelpCircle, label: dimension };
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: positive ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-3 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
        positive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-sm font-semibold ${positive ? "text-emerald-400" : "text-red-400"}`}>{meta.label}</span>
          <Badge variant={positive ? "success" : "destructive"} className="text-[10px] px-1.5 py-0">{score}/100</Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>
      </div>
    </motion.div>
  );
}

function FatalRiskItem({ text, index }: { text: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.15, duration: 0.4 }}
      className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10"
    >
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-500/20">
        <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </motion.div>
  );
}

function PivotCard({ pivot }: { pivot: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      className="relative overflow-hidden rounded border border-primary/20 bg-[#0d0d10] p-6"
    >
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] bg-primary/5 -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 border border-primary/20">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-mono text-primary">$ pivot</span>
        </div>
        <div className="flex items-start gap-3">
          <MoveRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm font-mono text-muted-foreground leading-relaxed">{pivot}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function VerdictTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  if (!blueprint) {
  return (
    <EmptyState
      icon={Scale}
      title="No verdict yet"
      description="Complete the founder interview to receive StartupOS's final judgment on your startup. Fair warning: it doesn't hold back."
      actionLabel="Start Interview"
      actionHref="/interview"
    />
  );
  }

  const { verdict } = blueprint;
  const config = badgeConfig[verdict.badge];
  const BadgeIcon = config.icon;
  const isPivot = verdict.suggestedPivot !== null;
  const dimEntries = Object.entries(verdict.dimensions) as [string, { score: number; label: string; description: string }][];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
      <motion.div variants={itemVariants} className="relative">
        <div className={`absolute inset-0 rounded-3xl ${config.bg} opacity-30 blur-3xl`} />
        <Card className={` relative overflow-hidden border-2 ${config.border} transition-all duration-500 hover:shadow-2xl ${config.glow}`}>
          <div className={`h-1 w-full bg-gradient-to-r ${config.gradient}`} />
          <CardContent className="p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                className="relative"
              >
                <motion.div
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className={`flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br ${config.gradient} shadow-2xl ${config.glow}`}
                >
                  <BadgeIcon className="h-12 w-12 text-white" />
                </motion.div>
                <motion.div
                  className={`absolute inset-0 rounded-[2rem] ${config.ring} ring-2`}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <div className="flex-1 text-center lg:text-left">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Badge className={`text-xs px-4 py-1.5 rounded-full border-0 bg-gradient-to-r ${config.gradient}`}>{config.label}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">Composite Score: {verdict.compositeScore}/100</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">Confidence: {verdict.confidenceLabel} ({verdict.confidence}%)</Badge>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"><span className="text-primary font-mono text-2xl crt-glow">$</span> StartupOS Verdict</h1>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">{config.description}</p>
                  <p className="text-sm text-foreground/80 mt-4 max-w-2xl leading-relaxed italic border-l-2 border-primary/30 pl-4">
                    &ldquo;{verdict.summary}&rdquo;
                  </p>
                  <p className="text-[10px] text-muted-foreground/20 font-mono mt-3 italic">
                    // generated from your interview data. not from a crystal ball. but close.
                  </p>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 border border-primary/20"><BarChart3 className="h-4 w-4 text-primary" /></div>
          <h2 className="text-lg font-bold mono-label"><span className="text-primary mr-2">$</span> 7-Dimension Assessment</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dimEntries.map(([key, dim]) => (
            <DimensionCard key={key} dimKey={key} score={dim.score} description={dim.description} />
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className=" hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-5 flex justify-center">
              <ScoreGauge value={verdict.compositeScore} label="Composite Score" icon={Scale} />
            </CardContent>
          </Card>
          <Card className=" hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-5 flex justify-center">
              <ScoreGauge value={verdict.confidence} label={`Confidence • ${verdict.confidenceLabel}`} icon={Award} />
            </CardContent>
          </Card>
          {verdict.strengths.slice(0, 2).map((s) => {
            const meta = dimensionMeta[s.dimension] || { icon: HelpCircle, label: s.dimension };
            return (
              <Card key={s.dimension} className="hover:border-emerald-500/20 transition-all duration-300">
                <CardContent className="p-5 flex justify-center">
                  <ScoreGauge value={s.score} label={meta.label} icon={meta.icon} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-emerald-400 mono-label"><span className="text-emerald-400 mr-2">$</span> Top Strengths</h2>
          </div>
          <div className="space-y-3">
            {verdict.strengths.length > 0 ? verdict.strengths.map((s, i) => (
              <TraitCard key={i} dimension={s.dimension} score={s.score} explanation={s.explanation} positive />
            )) : <p className="text-sm text-muted-foreground italic">No standout strengths identified yet.</p>}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-bold text-red-400 mono-label"><span className="text-red-400 mr-2">!</span> Top Weaknesses</h2>
          </div>
          <div className="space-y-3">
            {verdict.weaknesses.length > 0 ? verdict.weaknesses.map((w, i) => (
              <TraitCard key={i} dimension={w.dimension} score={w.score} explanation={w.explanation} positive={false} />
            )) : <p className="text-sm text-muted-foreground italic">No significant weaknesses identified.</p>}
          </div>
        </div>
      </motion.div>

      {verdict.fatalRisks.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className=" border-red-500/20 bg-[#0d0d10] overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-500" />
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-red-500/20 border border-red-500/30"><Crosshair className="h-4 w-4 text-red-400" /></div>
                <h2 className="text-lg font-bold text-red-400 mono-label"><span className="text-red-400 mr-2">!</span> Fatal Risks</h2>
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{verdict.fatalRisks.length} identified</Badge>
              </div>
              <div className="space-y-3">{verdict.fatalRisks.map((risk, i) => (<FatalRiskItem key={i} text={risk} index={i} />))}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isPivot && (
        <motion.div variants={itemVariants}><PivotCard pivot={verdict.suggestedPivot!} /></motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card className=" hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 border border-primary/20"><Award className="h-4 w-4 text-primary" /></div>
              <h2 className="text-lg font-bold mono-label"><span className="text-primary mr-2">$</span> Confidence Breakdown</h2>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{verdict.confidenceLabel}</Badge>
            </div>
            <div className="space-y-3">
              <ConfidenceFactor label="Data Completeness" value={verdict.confidenceBreakdown.dataCompleteness} />
              <ConfidenceFactor label="Stage Maturity" value={verdict.confidenceBreakdown.stageMaturity} />
              <ConfidenceFactor label="Dimension Agreement" value={verdict.confidenceBreakdown.dimensionAgreement} />
              <ConfidenceFactor label="Industry Signal" value={verdict.confidenceBreakdown.industrySignal} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Lightbulb className="h-4 w-4 text-primary" /></div>
          <h2 className="text-lg font-bold mono-label"><span className="text-primary mr-2">$</span> Improvement Paths</h2>
          <span className="text-xs text-muted-foreground font-mono">What would change your verdict</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {verdict.improvementPaths.map((p, i) => (
            <motion.div key={p.dimension} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}>
              <ImprovementCard dimension={p.dimension} action={p.action} gain={p.scoreGain} risk={p.risk} loss={p.scoreLoss} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-mono font-semibold mb-1"><span className="text-primary">$</span> How this verdict works</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  StartupOS evaluates your startup across 7 independent dimensions: <strong>Market</strong>, <strong>Timing</strong>, <strong>Competition</strong>, <strong>Defensibility</strong>, <strong>Founder-Fit</strong>, <strong>Distribution</strong>, and <strong>Revenue</strong>. Each dimension is scored 0-100 using industry benchmarks and stage adjustments. The composite score weights Defensibility and Revenue highest (20% each).
                </p>
                <p className="text-[9px] text-muted-foreground/20 font-mono mt-2 italic">
                  // it's not perfect. but it's more honest than your mom.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-[#0d0d10] transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-primary/10 border border-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-mono font-semibold mb-1"><span className="text-primary">$</span> What happens next?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This verdict is an independent assessment based on your interview data and industry benchmarks. Use the improvement paths above to identify the highest-impact actions. Or ignore everything and go with your gut. Your call.
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 gap-2">
                <Lightbulb className="h-4 w-4" />
                View Roadmap
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
