"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/contexts/auth-context";
import { useBrief } from "@/lib/hooks/use-brief";
import { toFriendlyError, apiClient, type ApiError } from "@/lib/api/client";
import {
  Loader2, AlertTriangle, ArrowLeft, Sparkles,
  CheckCircle2, Target, Crosshair, TrendingUp, Clock,
  Zap, RefreshCw,
} from "lucide-react";
import { persistStartupId } from "@/lib/utils/startup-utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function getScoreColor(score: number): string {
  if (score >= 75) return "text-primary";
  if (score >= 50) return "text-warning";
  if (score >= 25) return "text-orange-400";
  return "text-destructive";
}

function getScoreRing(score: number): string {
  if (score >= 75) return "stroke-primary";
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

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} className="transform -rotate-90 shrink-0">
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        className="text-border"
      />
      <circle
        cx={center} cy={center} r={radius}
        fill="none" strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={getScoreRing(score)}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
      />
    </svg>
  );
}

function BriefContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startupId = searchParams.get("startupId") || searchParams.get("id");
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { data: brief, isLoading, error, refetch, isFetching } = useBrief(startupId);

  const handleSignOut = async () => { await signOut(); router.push("/"); };
  const handleRefresh = () => { refetch(); };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[#0d0d10] border-b border-[rgba(34,197,94,0.12)]">
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
                <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={startupId ? `/dashboard?id=${startupId}` : "/blueprints"}
            className="inline-flex items-center gap-1 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            {brief && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(brief.generatedAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            )}
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 font-mono" onClick={handleRefresh} disabled={isFetching}>
              <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {!apiClient.getToken() ? (
          <Card className="terminal-card border-[rgba(34,197,94,0.12)]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Zap className="h-10 w-10 text-primary mb-3" />
              <p className="text-sm font-mono text-muted-foreground">Sign in to view daily briefs.</p>
              <p className="text-xs text-muted-foreground/60 mt-2">Create a free account to access your daily brief.</p>
              <Button size="sm" className="mt-4 font-mono" asChild>
                <Link href="/auth/sign-up">$ sign_up --begin</Link>
              </Button>
            </CardContent>
          </Card>
        ) : isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="font-mono text-sm text-primary animate-pulse">$ loading daily brief...</p>
          </div>
        )}

        {error && (
          <Card className={`terminal-card ${(error as unknown as ApiError).status === 401 ? "border-amber-500/30 bg-amber-500/5" : "border-red-500/30 bg-red-500/5"}`}>
            <CardContent className="flex items-center gap-3 p-6">
              <AlertTriangle className={`h-5 w-5 ${(error as unknown as ApiError).status === 401 ? "text-amber-400" : "text-red-400"}`} />
              <div className="flex-1">
                {(error as unknown as ApiError).status === 401 ? (
                  <>
                    <p className="text-sm font-medium text-amber-400">Authentication required</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{(error as unknown as ApiError).tokenExisted ? "Your session has expired. Please sign in again." : "Please sign up or sign in to continue."}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-red-400">Failed to load brief</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{toFriendlyError((error as unknown as ApiError).error || "An error occurred", (error as unknown as ApiError).tokenExisted)}</p>
                  </>
                )}
              </div>
              {(error as unknown as ApiError).status !== 401 && (
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              )}
            </CardContent>
          </Card>
        )}

        {!startupId && !isLoading && !error && (
          <Card className="terminal-card border-[rgba(34,197,94,0.12)]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Zap className="h-10 w-10 text-primary mb-3" />
              <p className="text-sm font-mono text-muted-foreground">No startup selected.</p>
              <Button size="sm" className="mt-4" asChild>
                <Link href="/blueprints">View My Startups</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {brief && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            <motion.div variants={itemVariants}>
              <Card className="terminal-card overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="relative">
                      <ScoreRing score={brief.healthScore} size={80} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-base font-bold font-mono ${getScoreColor(brief.healthScore)}`}>
                          {brief.healthScore}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Daily Brief</h2>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getScoreColor(brief.healthScore).replace("text-", "bg-").replace("400", "500/10") + " " + getScoreColor(brief.healthScore)}`}>
                          {getScoreLabel(brief.healthScore)}
                        </span>
                      </div>
                      <p className="text-base leading-relaxed">{brief.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div variants={itemVariants}>
                <Card className="terminal-card h-full">
                  <CardHeader className="terminal-panel-header pb-3">
                    <CardTitle className="text-sm font-mono font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Wins
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {brief.wins.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <CheckCircle2 className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">No wins yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Complete milestones to see them here</p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {brief.wins.map((win: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 py-2.5 border-t border-border first:border-t-0">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5 shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <p className="text-sm">{win}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="terminal-card h-full">
                  <CardHeader className="terminal-panel-header pb-3">
                    <CardTitle className="text-sm font-mono font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-amber-400" />
                      Priorities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {brief.priorities.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <Target className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">All caught up!</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">No priorities right now</p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {brief.priorities.map((priority: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 py-2.5 border-t border-border first:border-t-0">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 mt-0.5 shrink-0">
                              <Target className="h-3.5 w-3.5 text-amber-400" />
                            </div>
                            <p className="text-sm">{priority}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <Card className="terminal-card">
                <CardHeader className="terminal-panel-header pb-3">
                  <CardTitle className="text-sm font-mono font-semibold flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-blue-400" />
                    Competitor Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {brief.competitorUpdates.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <Crosshair className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No competitor updates</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Add competitors to start tracking changes</p>
                      {startupId && (
                        <Button size="sm" variant="outline" className="mt-3" asChild>
                          <Link href={`/competitors?startupId=${startupId}`}>Manage Competitors</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {brief.competitorUpdates.map((update: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 py-2.5 border-t border-border first:border-t-0">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 mt-0.5 shrink-0">
                            <Crosshair className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                          <p className="text-sm">{update}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="terminal-card">
                <CardHeader className="terminal-panel-header pb-3">
                  <CardTitle className="text-sm font-mono font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Health Score Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {brief.healthHistory.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <TrendingUp className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No health data yet</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Visit your dashboard to generate the first health score</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-end gap-1.5 h-32">
                        {brief.healthHistory.map((point: { score: number; createdAt: string }, i: number) => {
                          const height = Math.max(point.score, 4);
                          return (
                            <div
                              key={i}
                              className="flex-1 rounded-t relative group cursor-pointer"
                              style={{ height: `${height}%` }}
                            >
                              <div
                                className={`absolute bottom-0 left-0 right-0 rounded-t transition-all duration-200 ${
                                  point.score >= 75 ? "bg-primary/60" :
                                  point.score >= 50 ? "bg-warning/60" :
                                  point.score >= 25 ? "bg-orange-500/60" :
                                  "bg-destructive/60"
                                } hover:opacity-80`}
                                style={{ height: "100%" }}
                              />
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/10 backdrop-blur-xl text-foreground text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                                {point.score}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        {brief.healthHistory.length > 0 && (
                          <>
                            <span>{new Date(brief.healthHistory[0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            <span>{new Date(brief.healthHistory[brief.healthHistory.length - 1].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/60" /> Thriving (75-100)</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-warning/60" /> On Track (50-74)</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-orange-500/60" /> Developing (25-49)</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-destructive/60" /> Needs Work (0-24)</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function BriefPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <BriefContent />
    </Suspense>
  );
}
