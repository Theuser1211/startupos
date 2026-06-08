"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { useToast } from "@/components/ui/toast";
import type { InterviewData } from "@/lib/types";
import {
  Target,
  Lightbulb,
  Users,
  TrendingUp,
  Star,
  Shield,
  BarChart3,
  Rocket,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  UserCheck,
  DollarSign,
  Map,
  Flame,
  Sparkles,
  CheckCircle,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";
import { useState, useCallback, type ReactNode } from "react";

const iconMap: Record<string, typeof Star> = {
  positive: Lightbulb,
  opportunity: Rocket,
  warning: BarChart3,
  action: Users,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ─── Example startup definitions ─── */

const EXAMPLE_STARTUPS: { label: string; emoji: string; data: InterviewData }[] = [
  {
    label: "AI Lawyer",
    emoji: "⚖️",
    data: {
      idea: "AI lawyer for startups",
      stage: "ideation",
      industry: "ai",
      targetCustomer: "b2b-small",
      businessModel: "subscription",
      priceRange: "$50-200",
      problem: "cost",
    } as InterviewData,
  },
  {
    label: "Vet Marketplace",
    emoji: "🐾",
    data: {
      idea: "Veterinary marketplace",
      stage: "pre-seed",
      industry: "marketplace",
      targetCustomer: "b2c-mass",
      businessModel: "marketplace",
      priceRange: "$10-50",
      problem: "integration",
    } as InterviewData,
  },
  {
    label: "FinTech Compliance",
    emoji: "🏦",
    data: {
      idea: "FinTech compliance platform",
      stage: "seed",
      industry: "fintech",
      targetCustomer: "b2b-enterprise",
      businessModel: "subscription",
      priceRange: "$1000+",
      problem: "security",
    } as InterviewData,
  },
];

/* ─── Collapsible debug section ─── */

function DebugSection({ blueprint }: { blueprint: NonNullable<ReturnType<typeof useBlueprint>["blueprint"]> }) {
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const { loadInterviewData, generateWithAI, error, generationStatus, generationMode, generationError, interviewData } = useBlueprint();
  const { toast } = useToast();

  const handleLoadExample = useCallback((data: InterviewData) => {
    loadInterviewData(data);
    toast({
      variant: "success",
      title: "Blueprint loaded",
      message: `Loaded example startup data.`,
    });
  }, [loadInterviewData, toast]);

  const handleGenerateWithAI = useCallback(async () => {
    if (!interviewData) {
      toast({
        variant: "error",
        title: "No data",
        message: "Please load an example or complete the interview first.",
      });
      return;
    }
    setGenerating(true);
    try {
      await generateWithAI(interviewData);
      toast({
        variant: "success",
        title: "AI Blueprint generated",
        message: `Generated with ${generationMode === "ai" ? "AI" : "deterministic fallback"}.`,
        duration: 5000,
      });
    } catch {
      toast({
        variant: "error",
        title: "Generation failed",
        message: "AI blueprint generation failed, falling back to deterministic engine.",
      });
    } finally {
      setGenerating(false);
    }
  }, [generateWithAI, interviewData, generationMode, toast]);

  const isGenerating = generating || generationStatus === "generating";

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-amber-500/30 bg-amber-500/5 overflow-hidden">
        {/* Header - accessible toggle */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-controls="debug-section-content"
          aria-label={expanded ? "Collapse debug section" : "Expand debug section"}
          className="flex items-center justify-between px-5 py-3 cursor-pointer select-none border-b border-amber-500/10 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          onClick={toggleExpanded}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleExpanded(); } }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
              <FlaskConical className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-amber-400">Blueprint Debug Mode</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-500/70 border-amber-500/20">
              TEMPORARY
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-amber-500/50 font-mono">
              {blueprint.startupName}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-amber-400/60" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-400/60" />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 py-3 border-b border-amber-500/10">
          <p className="text-[10px] text-amber-500/50 mb-2 font-medium uppercase tracking-wider">Load Example Startup</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_STARTUPS.map((ex) => (
              <Button
                key={ex.label}
                variant="outline"
                size="sm"
                onClick={() => handleLoadExample(ex.data)}
                aria-label={`Load ${ex.label} example`}
                className="text-xs border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40 text-amber-300"
              >
                <span className="mr-1.5" aria-hidden="true">{ex.emoji}</span>
                {ex.label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              aria-label={isGenerating ? "Generating blueprint with AI" : "Generate blueprint with AI"}
              className="text-xs border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 text-purple-300 ml-1"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin mr-1.5" role="status" aria-label="Generating" />
                  Generating...
                </>
              ) : generationMode === "ai" ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />
                  AI Generated
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>

          {/* Generation progress */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3"
            >
              <div className="relative h-1 rounded-full bg-purple-500/10 overflow-hidden">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-[10px] text-purple-400/60 mt-1.5">
                Generating AI blueprint...
              </p>
            </motion.div>
          )}

          {/* Error display */}
          {error && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-start gap-2"
            >
              <AlertCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-400/90 leading-relaxed">
                {error}
              </p>
            </motion.div>
          )}

          {/* Success state */}
          {aiGenerated && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-1.5"
            >
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400/80">
                AI blueprint generated successfully
              </span>
            </motion.div>
          )}
        </div>

        {/* Debug data */}
        {expanded && (
          <div id="debug-section-content" className="p-5 space-y-5">
            <DebugField icon={Star} label="Startup Name" value={blueprint.startupName} />

            <SectionBlock icon={UserCheck} label="Ideal Customer Profile (ICP)">
              <DebugField label="Title" value={blueprint.icp.title} />
              <DebugField label="Role" value={blueprint.icp.role} />
              <DebugField label="Company Size" value={blueprint.icp.companySize} />
              <DebugField label="Description" value={blueprint.icp.description} />
              <DebugList label="Pain Points" items={blueprint.icp.painPoints} />
              <DebugList label="Goals" items={blueprint.icp.goals} />
              <DebugList label="Objections" items={blueprint.icp.objections} />
            </SectionBlock>

            <SectionBlock icon={DollarSign} label="Revenue">
              <DebugField label="Model" value={blueprint.revenue.model} />
              <DebugField label="Pricing" value={blueprint.revenue.pricing} />
              <DebugField label="Funding" value={blueprint.revenue.funding} />
              <DebugField label="Analysis" value={blueprint.revenue.analysis} />
            </SectionBlock>

            <SectionBlock icon={Map} label="Roadmap">
              {blueprint.roadmap.map((phase) => (
                <div key={phase.quarter} className="mb-3 last:mb-0">
                  <p className="text-[11px] font-semibold text-foreground/80 mb-1.5">{phase.quarter}</p>
                  <div className="space-y-1">
                    {phase.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border ${
                            item.status === "done"
                              ? "bg-emerald-500/20 border-emerald-500/40"
                              : item.status === "in-progress"
                                ? "bg-amber-500/20 border-amber-500/40"
                                : "bg-muted border-muted-foreground/20"
                          }`}
                        />
                        <div>
                          <span className="text-foreground/90 font-medium">{item.title}</span>
                          <span className="text-muted-foreground ml-1">— {item.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </SectionBlock>

            <SectionBlock icon={Flame} label="Roast">
              <DebugField label="Score" value={`${blueprint.roast.score}/10`} />
              <DebugField label="Verdict" value={blueprint.roast.verdict} />
              <DebugList label="Risks" items={blueprint.roast.risks} />
              <DebugList label="Recommendations" items={blueprint.roast.recommendations} />
            </SectionBlock>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function DebugField({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Star }) {
  return (
    <div className="flex items-start gap-2 py-1">
      {Icon && <Icon className="h-3.5 w-3.5 text-amber-400/60 mt-0.5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-medium text-amber-500/60 uppercase tracking-wider block mb-0.5">{label}</span>
        <span className="text-[12px] text-foreground/90 leading-relaxed">{value}</span>
      </div>
    </div>
  );
}

function DebugList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="py-1">
      <span className="text-[10px] font-medium text-amber-500/60 uppercase tracking-wider block mb-1">{label}</span>
      <div className="space-y-0.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px] text-foreground/80">
            <span className="text-amber-400/40 mt-0.5 shrink-0">◆</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionBlock({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Star;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-500/10">
        <Icon className="h-4 w-4 text-amber-400" />
        <span className="text-xs font-semibold text-amber-300">{label}</span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

/* ─── Main Overview Tab ─── */

export function OverviewTab() {
  const { blueprint } = useBlueprint();
  if (!blueprint) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="No blueprint loaded"
        description="Complete the founder interview or load an example startup to see your personalized dashboard with brand score, market fit, insights, and more."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { startupName, companySnapshot, stats, insights } = blueprint;

  const statCards = [
    { label: "Brand Score", value: `${stats.brandScore}`, icon: Star, color: "from-purple-500 to-indigo-600", change: "+8" },
    { label: "Market Fit", value: stats.marketFit, icon: Target, color: "from-blue-500 to-cyan-600", change: "+2" },
    { label: "Readiness", value: `${stats.readiness}%`, icon: Shield, color: "from-emerald-500 to-teal-600", change: "+12%" },
    { label: "Growth Score", value: `${stats.growthScore}`, icon: TrendingUp, color: "from-amber-500 to-orange-600", change: "+5" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Debug Section — always visible at the top */}
      <DebugSection blueprint={blueprint} />

      {/* Welcome */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">
          Welcome back{startupName ? `, ${startupName.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your {startupName || "startup"} dashboard overview.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">
                    +{stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Insights */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {insights.map((insight) => {
            const Icon = iconMap[insight.type] || Lightbulb;
            const typeColors: Record<string, string> = {
              positive: "border-emerald-500/20 bg-emerald-500/5",
              opportunity: "border-blue-500/20 bg-blue-500/5",
              warning: "border-amber-500/20 bg-amber-500/5",
              action: "border-purple-500/20 bg-purple-500/5",
            };
            const iconColors: Record<string, string> = {
              positive: "text-emerald-400",
              opportunity: "text-blue-400",
              warning: "text-amber-400",
              action: "text-purple-400",
            };
            return (
              <div
                key={insight.title}
                className={`rounded-xl border p-5 ${typeColors[insight.type]} transition-all duration-300 hover:shadow-lg`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColors[insight.type]}`} />
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Company Details */}
      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Company Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { label: "Company", value: startupName },
                { label: "Stage", value: companySnapshot.stage },
                { label: "Industry", value: companySnapshot.industry },
                { label: "Funding", value: companySnapshot.funding },
                { label: "Team Size", value: `${companySnapshot.teamSize} people` },
                { label: "Founded", value: companySnapshot.foundedDate },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
