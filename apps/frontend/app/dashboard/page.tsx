"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/contexts/auth-context";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import {
  Loader2, AlertTriangle, ArrowLeft, TrendingUp,
  Target, Globe, Rocket, Activity,
  CheckCircle2, Circle, ChevronRight,
} from "lucide-react";

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
  high: "text-red-400 border-red-500/30 bg-red-500/10",
  medium: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  low: "text-blue-400 border-blue-500/30 bg-blue-500/10",
};

function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 25) return "text-orange-400";
  return "text-red-400";
}

function getScoreRing(score: number): string {
  if (score >= 75) return "stroke-emerald-400";
  if (score >= 50) return "stroke-amber-400";
  if (score >= 25) return "stroke-orange-400";
  return "stroke-red-400";
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
        className="text-glass-border"
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

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startupId = searchParams.get("id");
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { data: dashboard, isLoading, error, refetch } = useDashboard(startupId);
  const [showAllActions, setShowAllActions] = useState(false);

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
      <header className="glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/">
            <Image src="/logo-full.png" alt="StartupOS" width={1536} height={1024} className="h-5 w-auto" />
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
        <Link href="/blueprints" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Startups
        </Link>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="flex items-center gap-3 p-6">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Failed to load dashboard</p>
                <p className="text-xs text-muted-foreground mt-0.5">{(error as { error?: string })?.error || "An error occurred"}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {!startupId && !isLoading && !error && (
          <Card className="border-glass-border bg-glass-bg">
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
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">{dashboard.startup.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {dashboard.startup.industry || "No industry set"}
                </p>
              </div>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
              <motion.div variants={itemVariants} className="lg:col-span-1">
                <Card className="border-glass-border bg-glass-bg h-full">
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="relative mb-4">
                      <ScoreRing score={dashboard.healthScore} size={160} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold font-display ${getScoreColor(dashboard.healthScore)}`}>
                          {dashboard.healthScore}
                        </span>
                        <span className={`text-xs font-medium mt-0.5 ${getScoreColor(dashboard.healthScore)}`}>
                          {getScoreLabel(dashboard.healthScore)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                      Overall startup health based on milestones completed and recent activity
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <Card className="border-glass-border bg-glass-bg">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                          <Target className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Foundational</span>
                      </div>
                      <span className={`text-2xl font-bold font-display ${dashboard.healthBreakdown.foundational >= 25 ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {dashboard.healthBreakdown.foundational}/25
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1">Interview & blueprint completed</p>
                    </CardContent>
                  </Card>

                  <Card className="border-glass-border bg-glass-bg">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                          <Globe className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</span>
                      </div>
                      <span className={`text-2xl font-bold font-display ${dashboard.healthBreakdown.product >= 25 ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {dashboard.healthBreakdown.product}/25
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1">Website generated</p>
                    </CardContent>
                  </Card>

                  <Card className="border-glass-border bg-glass-bg">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                          <Rocket className="h-4 w-4 text-amber-400" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Launch</span>
                      </div>
                      <span className={`text-2xl font-bold font-display ${dashboard.healthBreakdown.launch >= 25 ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {dashboard.healthBreakdown.launch}/25
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1">Website deployed live</p>
                    </CardContent>
                  </Card>

                  <Card className="border-glass-border bg-glass-bg">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                          <Activity className="h-4 w-4 text-purple-400" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Engagement</span>
                      </div>
                      <span className={`text-2xl font-bold font-display ${dashboard.healthBreakdown.engagement >= 25 ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {dashboard.healthBreakdown.engagement}/25
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1">Activity in last 14 days</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <Card className="border-glass-border bg-glass-bg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboard.recentEvents.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No activity yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Complete your interview to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {dashboard.recentEvents.slice(0, 10).map((event, i) => (
                          <div key={event.id} className="flex items-start gap-3 py-2.5 border-t border-glass-border first:border-t-0">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5 shrink-0">
                              <Circle className="h-2 w-2 text-primary fill-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{EVENT_LABELS[event.type] || event.type}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
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
                <Card className="border-glass-border bg-glass-bg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboard.topActions.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400/60 mb-2" />
                        <p className="text-sm text-muted-foreground">All caught up!</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">No recommended actions right now</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(showAllActions ? dashboard.topActions : dashboard.topActions.slice(0, 3)).map((action) => (
                          <div
                            key={action.id}
                            className="rounded-xl border border-glass-border bg-glass-bg/50 p-4 hover:border-primary/30 transition-all duration-200"
                          >
                            <div className="flex items-start gap-3">
                              <Badge className={`mt-0.5 text-[10px] px-1.5 py-0.5 border ${PRIORITY_COLORS[action.priority] || ""}`}>
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
                          </div>
                        ))}
                        {dashboard.topActions.length > 3 && (
                          <button
                            onClick={() => setShowAllActions(!showAllActions)}
                            className="w-full text-xs text-muted-foreground hover:text-foreground py-2 transition-colors"
                          >
                            {showAllActions ? "Show less" : `Show all ${dashboard.topActions.length} actions`}
                          </button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
