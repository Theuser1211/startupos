"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/contexts/auth-context";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { toFriendlyError } from "@/lib/api/client";
import { FortuneCookie } from "@/components/dashboard/fortune-cookie";
import { DeathPredictor } from "@/components/dashboard/death-predictor";
import {
  Loader2, AlertTriangle, ArrowLeft, TrendingUp,
  Target, Globe, Rocket, Activity,
  CheckCircle2, ChevronRight, Zap,
} from "lucide-react";
import type { DashboardData } from "@startupos/shared";
import { persistStartupId } from "@/lib/utils/startup-utils";

const EVENT_LABELS: Record<string, string> = {
  STARTUP_CREATED: "Startup Created",
  BLUEPRINT_GENERATED: "Blueprint Generated",
  BLUEPRINT_VIEWED: "Blueprint Viewed",
  WEBSITE_GENERATED: "Website Generated",
  WEBSITE_DEPLOYED: "Website Deployed",
  DEPLOYMENT_FAILED: "Deployment Failed",
  DASHBOARD_VIEWED: "Dashboard Viewed",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "text-red-400 border-red-500/30 bg-surface-red",
  medium: "text-amber-400 border-amber-500/30 bg-surface-amber",
  low: "text-info border-cyan-500/30 bg-surface-cyan",
};

const MICROCOPY: Record<string, string> = {
  no_activity: "No customer interviews detected. Leave the cave.",
  all_caught_up: "Your startup is still alive. Keep shipping.",
  needs_work: "Distribution beats features. Go talk to users.",
  thriving: "Founders who ship win. You're doing it right.",
  on_track: "Slow is smooth, smooth is fast. Keep building.",
  developing: "Your biggest risk is building something nobody wants. Validate.",
};

const BADGE_CONFIG = [
  { key: "launched", label: "Launched", emoji: "🚀", color: "text-info border-info/30 bg-surface-cyan" },
  { key: "building", label: "Building", emoji: "🛠️", color: "text-primary border-primary/30 bg-surface-green" },
  { key: "momentum", label: "Momentum", emoji: "🔥", color: "text-warning border-warning/30 bg-surface-amber" },
  { key: "pivot_risk", label: "Pivot Risk", emoji: "⚠️", color: "text-warning border-warning/30 bg-surface-amber" },
  { key: "danger_zone", label: "Danger Zone", emoji: "💀", color: "text-destructive border-destructive/30 bg-surface-red" },
];

function getStatusBadges(dashboard: DashboardData) {
  const badges: { key: string }[] = [];
  if (dashboard.healthBreakdown.launch >= 20) badges.push({ key: "launched" });
  if (dashboard.healthBreakdown.product > 0) badges.push({ key: "building" });
  if (dashboard.healthBreakdown.engagement >= 15) badges.push({ key: "momentum" });
  if (dashboard.healthScore < 30) badges.push({ key: "pivot_risk" });
  if (dashboard.healthScore < 15) {
    badges.push({ key: "danger_zone" });
    return badges.filter((b) => b.key !== "pivot_risk");
  }
  return badges;
}

function getMicrocopy(score: number, hasActivity: boolean): string {
  if (!hasActivity) return MICROCOPY.no_activity;
  if (score >= 75) return MICROCOPY.thriving;
  if (score >= 50) return MICROCOPY.on_track;
  if (score >= 25) return MICROCOPY.developing;
  return MICROCOPY.needs_work;
}

function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current === value) return;
    prevRef.current = value;
    let startTime: number | null = null;
    const raf = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [value, duration]);

  return <>{displayed}</>;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-warning";
  if (score >= 25) return "text-orange-400";
  return "text-destructive";
}

function getScoreRing(score: number): string {
  if (score >= 75) return "stroke-success";
  if (score >= 50) return "stroke-warning";
  if (score >= 25) return "stroke-orange-400";
  return "stroke-destructive";
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Thriving";
  if (score >= 50) return "On Track";
  if (score >= 25) return "Developing";
  return "Needs Work";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function asciiBar(value: number, max: number, length = 12): string {
  const filled = Math.round((value / max) * length);
  return "\u2588".repeat(filled) + "\u2591".repeat(length - filled);
}

function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        className="text-border"
      />
      <circle
        cx={center} cy={center} r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={getScoreRing(score)}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
      />
    </svg>
  );
}

function TerminalHealthCard({ dashboard: d }: { dashboard: DashboardData }) {
  return (
    <div className="terminal-card p-5 h-full font-mono text-sm space-y-3">
      <div className="flex items-center gap-2 text-xs text-primary/60 mb-3">
        <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse-subtle" />
        <span className="tracking-wide">startup analyze --health</span>
      </div>
      <div className="space-y-2.5">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Foundational</span>
            <span className={d.healthBreakdown.foundational >= 20 ? "text-success" : "text-muted-foreground"}>{d.healthBreakdown.foundational}/25</span>
          </div>
          <div className="text-xs tracking-wider">
            <span className="text-success">{asciiBar(d.healthBreakdown.foundational, 25, 14)}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Product</span>
            <span className={d.healthBreakdown.product >= 20 ? "text-success" : "text-muted-foreground"}>{d.healthBreakdown.product}/25</span>
          </div>
          <div className="text-xs tracking-wider">
            <span className="text-success">{asciiBar(d.healthBreakdown.product, 25, 14)}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Launch</span>
            <span className={d.healthBreakdown.launch >= 20 ? "text-success" : "text-muted-foreground"}>{d.healthBreakdown.launch}/25</span>
          </div>
          <div className="text-xs tracking-wider">
            <span className="text-success">{asciiBar(d.healthBreakdown.launch, 25, 14)}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Engagement</span>
            <span className={d.healthBreakdown.engagement >= 20 ? "text-success" : "text-muted-foreground"}>{d.healthBreakdown.engagement}/25</span>
          </div>
          <div className="text-xs tracking-wider">
            <span className="text-success">{asciiBar(d.healthBreakdown.engagement, 25, 14)}</span>
          </div>
        </div>
      </div>
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total Score</span>
          <span className={`font-bold ${getScoreColor(d.healthScore)}`}>{d.healthScore}/100</span>
        </div>
      </div>
    </div>
  );
}

function StartupBadges({ dashboard }: { dashboard: DashboardData }) {
  const active = getStatusBadges(dashboard);
  if (active.length === 0) return null;
  const configs = active.map((b) => BADGE_CONFIG.find((c) => c.key === b.key)).filter(Boolean);

  return (
    <div className="flex flex-wrap gap-2">
      {configs.map((c) => (
        <span
          key={c!.key}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${c!.color}`}
        >
          <span>{c!.emoji}</span>
          {c!.label}
        </span>
      ))}
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startupId = searchParams.get("id");
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { data: dashboard, isLoading, error, refetch } = useDashboard(startupId);
  const [showAllActions, setShowAllActions] = useState(false);

  console.log("[Dashboard] startupId from URL:", startupId, "| dashboard data:", dashboard?.startup?.id);

  useEffect(() => {
    if (startupId) {
      persistStartupId(startupId);
      console.log("[Dashboard] Persisted startupId:", startupId);
    }
  }, [startupId]);

  const handleSignOut = async () => { await signOut(); router.push("/"); };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-square.png" alt="StartupOS" width={1254} height={1254} className="h-6 w-6" />
            <span className="text-sm font-bold tracking-tight">
              Startup<span className="text-primary">OS</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-3">
                <Link href="/blueprints">
                  <Button variant="ghost" size="sm" className="text-xs">My Startups</Button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link href="/blueprints" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors font-mono">
          <ArrowLeft className="h-3.5 w-3.5" /> ../startups
        </Link>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <Card className="border-destructive/30 bg-surface-red">
            <CardContent className="flex items-center gap-3 p-6">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Failed to load dashboard</p>
                <p className="text-xs text-muted-foreground mt-0.5">{toFriendlyError((error as { error?: string })?.error || "An error occurred")}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {!startupId && !isLoading && !error && (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Activity className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Select a startup to view its dashboard</p>
              <Button size="sm" className="mt-4" asChild>
                <Link href="/blueprints">View My Startups</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {dashboard && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <motion.div variants={itemVariants}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl font-display font-bold text-foreground">{dashboard.startup.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {dashboard.startup.industry || "no industry set"}<span className="animate-terminal-blink ml-0.5 text-primary">_</span>
                  </p>
                </div>
                <StartupBadges dashboard={dashboard} />
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic border-l-2 border-primary/30 pl-3">
                &ldquo;{getMicrocopy(dashboard.healthScore, dashboard.recentEvents.length > 0)}&rdquo;
              </p>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
              <motion.div variants={itemVariants} className="lg:col-span-1">
                <Card className="border-border bg-card h-full hover:border-primary/20 transition-all duration-200 hover:shadow-lg group">
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="relative mb-4">
                      <ScoreRing score={dashboard.healthScore} size={160} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                          className={`text-4xl font-bold font-mono ${getScoreColor(dashboard.healthScore)}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <AnimatedCounter value={dashboard.healthScore} />
                        </motion.span>
                        <span className={`text-xs font-mono mt-0.5 ${getScoreColor(dashboard.healthScore)}`}>
                          {getScoreLabel(dashboard.healthScore)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center max-w-[200px] font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                      health score based on milestones &amp; activity
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="lg:col-span-2">
                <TerminalHealthCard dashboard={dashboard} />
              </motion.div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <Card className="border-border bg-card h-full hover:border-primary/20 transition-all duration-200 group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 font-mono">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>Recent Activity</span>
                      <span className="text-[10px] text-muted-foreground font-normal ml-auto opacity-0 group-hover:opacity-100 transition-opacity">git log --oneline</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboard.recentEvents.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No activity detected</p>
                        <p className="text-xs text-muted-foreground/60 mt-1 font-mono">No customer interviews. Leave the cave.</p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {dashboard.recentEvents.slice(0, 10).map((event, i) => (
                          <div key={event.id} className="flex items-start gap-3 py-2.5 border-t border-border first:border-t-0 group/event">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5 shrink-0 group-hover/event:bg-primary/20 transition-colors">
                              <CheckCircle2 className="h-2.5 w-2.5 text-primary fill-primary/30" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{EVENT_LABELS[event.type] || event.type}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                                {new Date(event.createdAt).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-border bg-card h-full hover:border-primary/20 transition-all duration-200 group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 font-mono">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>Next Actions</span>
                      <span className="text-[10px] text-muted-foreground font-normal ml-auto opacity-0 group-hover:opacity-100 transition-opacity">priority sorted</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboard.topActions.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <CheckCircle2 className="h-8 w-8 text-success/60 mb-2" />
                        <p className="text-sm text-muted-foreground">All caught up!</p>
                        <p className="text-xs text-muted-foreground/60 mt-1 italic">Your startup is still alive. Keep shipping.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(showAllActions ? dashboard.topActions : dashboard.topActions.slice(0, 3)).map((action) => (
                          <motion.div
                            key={action.id}
                            className="rounded-lg border border-border bg-surface p-4 hover:border-primary/20 hover:bg-surface-hover transition-all duration-200 cursor-default"
                            whileHover={{ x: 2 }}
                          >
                            <div className="flex items-start gap-3">
                              <Badge className={`mt-0.5 text-[10px] px-1.5 py-0.5 border font-mono ${PRIORITY_COLORS[action.priority] || ""}`}>
                                {action.priority}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{action.action}</p>
                                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                              </div>
                            </div>
                            {action.link && (
                              <div className="mt-3 flex justify-end">
                                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" asChild>
                                  <Link href={action.link}>
                                    Go <ChevronRight className="h-3 w-3" />
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                        {dashboard.topActions.length > 3 && (
                          <button
                            onClick={() => setShowAllActions(!showAllActions)}
                            className="w-full text-xs text-muted-foreground hover:text-foreground py-2 transition-colors font-mono"
                          >
                            {showAllActions ? "show less" : `show all ${dashboard.topActions.length} actions`}
                          </button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <FortuneCookie />
              </motion.div>
              <motion.div variants={itemVariants}>
                <DeathPredictor dashboard={dashboard} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
