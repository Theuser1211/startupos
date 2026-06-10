"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Users, CreditCard, BarChart3, Activity, Sparkles, TrendingUp,
  AlertTriangle, Loader2,  RefreshCw, XCircle, Globe,
  Cpu, Clock, CheckCircle, Database, RotateCw,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Types ─── */

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalBlueprints: number;
  totalLogos: number;
  recentSignups: number;
  revenue: number;
}

interface RecentUser {
  id: string;
  email: string;
  display_name: string | null;
  plan: string;
  status: string;
  created_at: string;
}

interface JobCounts {
  queued: number;
  generating: number;
  completed: number;
  failed: number;
  total: number;
}

interface JobSummary {
  id: string;
  user_id: string;
  type: "website" | "logo";
  status: string;
  provider: string | null;
  model: string | null;
  duration_ms: number | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  user_email?: string;
}

interface ErrorLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  details: { message?: string; [key: string]: unknown };
  created_at: string;
}

/* ─── Helpers ─── */

function statusBadge(status: string) {
  const config: Record<string, { label: string; variant: "default" | "outline" | "success" | "warning" | "destructive" }> = {
    queued: { label: "Queued", variant: "outline" },
    generating: { label: "Running", variant: "warning" },
    completed: { label: "Done", variant: "success" },
    failed: { label: "Failed", variant: "destructive" },
    cancelled: { label: "Cancelled", variant: "outline" },
  };
  const c = config[status] || { label: status, variant: "outline" as const };
  return <Badge variant={c.variant} className="text-[10px]">{c.label}</Badge>;
}

function durationStr(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString();
}

/* ─── Tabs ─── */

type TabId = "overview" | "jobs" | "errors";

/* ─── Component ─── */

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Overview state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  // Job queue state
  const [jobType, setJobType] = useState<"website" | "logo">("website");
  const [jobStatusFilter, setJobStatusFilter] = useState<string>("");
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [jobCounts, setJobCounts] = useState<JobCounts | null>(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);

  // Error logs state
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
  const [errorLogsLoading, setErrorLogsLoading] = useState(false);

  // Shared
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* ─── Fetch overview ─── */

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized — admin access only");
        if (res.status === 403) throw new Error("Forbidden — you don't have admin permissions");
        throw new Error("Failed to load admin data");
      }
      const data = await res.json();
      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin dashboard");
    } finally {
      setIsLoading(false);
      setAuthLoading(false);
    }
  }, []);

  /* ─── Fetch jobs ─── */

  const fetchJobs = useCallback(async (type: string, status?: string) => {
    setJobsLoading(true);
    try {
      const params = new URLSearchParams({ type, limit: "100" });
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/jobs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setJobCounts(data.counts || null);
      }
    } catch {
      // Silently retry
    } finally {
      setJobsLoading(false);
    }
  }, []);

  /* ─── Fetch error logs ─── */

  const fetchErrorLogs = useCallback(async () => {
    setErrorLogsLoading(true);
    try {
      const res = await fetch("/api/admin/errors");
      if (res.ok) {
        const data = await res.json();
        setErrorLogs(data.errors || []);
      }
    } catch {
      // Silently retry
    } finally {
      setErrorLogsLoading(false);
    }
  }, []);

  /* ─── Retry job ─── */

  const handleRetry = useCallback(async (jobId: string, type: "website" | "logo") => {
    setRetrying(jobId);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, type }),
      });
      if (res.ok) {
        await fetchJobs(jobType, jobStatusFilter);
      }
    } catch {
      // Silently fail
    } finally {
      setRetrying(null);
    }
  }, [fetchJobs, jobType, jobStatusFilter]);

  /* ─── Initial loads ─── */

  useEffect(() => {
    fetchAdminData();
    fetchJobs("website");
    fetchErrorLogs();
  }, [fetchAdminData, fetchJobs, fetchErrorLogs]);

  /* ─── Reload when tab changes ─── */

  useEffect(() => {
    if (activeTab === "jobs") fetchJobs(jobType, jobStatusFilter);
    if (activeTab === "errors") fetchErrorLogs();
  }, [activeTab, jobType, jobStatusFilter, fetchJobs, fetchErrorLogs]);

  /* ─── Loading state ─── */

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Access Restricted</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Link href="/">
              <Button variant="outline" size="sm">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Stat cards ─── */

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "from-blue-500 to-cyan-600" },
    { label: "Active Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: CreditCard, color: "from-emerald-500 to-teal-600" },
    { label: "Blueprints Generated", value: stats?.totalBlueprints ?? 0, icon: BarChart3, color: "from-purple-500 to-indigo-600" },
    { label: "Logos Generated", value: stats?.totalLogos ?? 0, icon: Activity, color: "from-amber-500 to-orange-600" },
    { label: "Signups (30d)", value: stats?.recentSignups ?? 0, icon: TrendingUp, color: "from-pink-500 to-rose-600" },
    { label: "Revenue (MRR)", value: `₹${(stats?.revenue ?? 0).toLocaleString("en-IN")}`, icon: Sparkles, color: "from-primary to-secondary" },
  ];

  const jobCountCards = [
    { label: "Queued", value: jobCounts?.queued ?? 0, icon: Clock, color: "from-blue-500 to-indigo-600" },
    { label: "Running", value: jobCounts?.generating ?? 0, icon: Loader2, color: "from-amber-500 to-orange-600" },
    { label: "Completed", value: jobCounts?.completed ?? 0, icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
    { label: "Failed", value: jobCounts?.failed ?? 0, icon: XCircle, color: "from-red-500 to-rose-600" },
    { label: "Total", value: jobCounts?.total ?? 0, icon: Database, color: "from-primary to-secondary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-full.png"
                alt="StartupOS"
                width={1536}
                height={1024}
                className="h-5 w-auto"
              />
            </Link>
            <Badge variant="outline" className="text-[10px]">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
              onClick={() => {
                fetchAdminData();
                if (activeTab === "jobs") fetchJobs(jobType, jobStatusFilter);
                if (activeTab === "errors") fetchErrorLogs();
              }}
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs">Exit Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold mb-1">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mb-6">Platform overview and management</p>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="mb-6">
            <TabsList>
              <TabsTrigger value="overview" className="text-xs gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="jobs" className="text-xs gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                Job Queue
                {jobCounts && jobCounts.failed > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                    {jobCounts.failed}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="errors" className="text-xs gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Error Logs
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {/* ────── OVERVIEW TAB ────── */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
                    {statCards.map((stat) => (
                      <Card key={stat.label} className="hover:border-primary/20 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-md`}>
                              <stat.icon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-xs text-muted-foreground">{stat.label}</span>
                          </div>
                          <p className="text-xl font-bold">{stat.value}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Recent Users */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Recent Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-glass-border">
                                <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">User</th>
                                <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">Plan</th>
                                <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">Status</th>
                                <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">Joined</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentUsers.map((user) => (
                                <tr key={user.id} className="border-b border-glass-border/50 hover:bg-white/5 transition-colors">
                                  <td className="py-3 px-2">
                                    <div className="flex items-center gap-2">
                                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-white">
                                        {(user.display_name || user.email || "U").charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium">{user.display_name || "Unnamed"}</p>
                                        <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2">
                                    <Badge variant={user.plan === "pro" ? "default" : "outline"} className="text-[10px]">
                                      {user.plan}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-2">
                                    <span className={`text-[10px] ${user.status === "active" ? "text-emerald-400" : "text-muted-foreground"}`}>
                                      {user.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-[10px] text-muted-foreground">
                                    {new Date(user.created_at).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ────── JOB QUEUE TAB ────── */}
              {activeTab === "jobs" && (
                <motion.div
                  key="jobs"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Job type toggle */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1 rounded-lg border border-glass-border p-0.5">
                      <button
                        onClick={() => { setJobType("website"); setJobStatusFilter(""); }}
                        className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                          jobType === "website" ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Globe className="h-3 w-3 inline mr-1" />
                        Website Spec
                      </button>
                      <button
                        onClick={() => { setJobType("logo"); setJobStatusFilter(""); }}
                        className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                          jobType === "logo" ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Activity className="h-3 w-3 inline mr-1" />
                        Logo Gen
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="h-4 w-px bg-glass-border" />

                    {/* Status filter buttons */}
                    <div className="flex gap-1">
                      {["", "queued", "generating", "completed", "failed"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setJobStatusFilter(s)}
                          className={`px-2.5 py-1.5 text-[10px] rounded-md transition-all ${
                            jobStatusFilter === s
                              ? "bg-white/10 text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Count cards */}
                  <div className="grid gap-3 grid-cols-5 mb-6">
                    {jobCountCards.map((c) => (
                      <Card key={c.label} className="hover:border-primary/20 transition-all">
                        <CardContent className="p-3 text-center">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${c.color} shadow-md mx-auto mb-1`}>
                            <c.icon className="h-3 w-3 text-white" />
                          </div>
                          <p className="text-lg font-bold">{String(c.value)}</p>
                          <p className="text-[10px] text-muted-foreground">{c.label}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Job list */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-primary" />
                        {jobType === "website" ? "Website Spec" : "Logo"} Jobs
                        {jobStatusFilter && <Badge variant="outline" className="text-[10px]">{jobStatusFilter}</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {jobsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : jobs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No jobs found</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-glass-border">
                                <th className="text-left py-2 px-2 text-[10px] text-muted-foreground font-medium">ID</th>
                                <th className="text-left py-2 px-2 text-[10px] text-muted-foreground font-medium">User</th>
                                <th className="text-left py-2 px-2 text-[10px] text-muted-foreground font-medium">Status</th>
                                <th className="text-left py-2 px-2 text-[10px] text-muted-foreground font-medium">Provider</th>
                                <th className="text-left py-2 px-2 text-[10px] text-muted-foreground font-medium">Duration</th>
                                <th className="text-left py-2 px-2 text-[10px] text-muted-foreground font-medium">Created</th>
                                <th className="text-left py-2 px-2 text-[10px] text-muted-foreground font-medium">Error</th>
                                <th className="text-left py-2 px-2 text-[10px] text-muted-foreground font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {jobs.map((job) => (
                                <tr key={job.id} className="border-b border-glass-border/50 hover:bg-white/5 transition-colors">
                                  <td className="py-2.5 px-2">
                                    <code className="text-[10px] text-muted-foreground font-mono">
                                      {job.id.substring(0, 8)}...
                                    </code>
                                  </td>
                                  <td className="py-2.5 px-2">
                                    <span className="text-xs">{job.user_email || job.user_id.substring(0, 8)}</span>
                                  </td>
                                  <td className="py-2.5 px-2">{statusBadge(job.status)}</td>
                                  <td className="py-2.5 px-2">
                                    <span className="text-[10px] text-muted-foreground">
                                      {job.provider || "—"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2">
                                    <span className="text-[10px] text-muted-foreground">
                                      {durationStr(job.duration_ms)}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2">
                                    <span className="text-[10px] text-muted-foreground" title={job.created_at}>
                                      {timeAgo(job.created_at)}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 max-w-[200px]">
                                    {job.error_message ? (
                                      <span className="text-[10px] text-red-400 truncate block" title={job.error_message}>
                                        {job.error_message}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground">—</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-2">
                                    <div className="flex gap-1">
                                      {job.status === "failed" && (
                                        <button
                                          onClick={() => handleRetry(job.id, job.type)}
                                          disabled={retrying === job.id}
                                          className="p-1 rounded text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                          title="Retry job"
                                        >
                                          {retrying === job.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <RotateCw className="h-3 w-3" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Job Status Legend */}
                  <div className="flex items-center gap-4 mt-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-blue-400/60" /> Queued
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-amber-400/60" /> Running
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-400/60" /> Completed
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-400/60" /> Failed
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ────── ERROR LOGS TAB ────── */}
              {activeTab === "errors" && (
                <motion.div
                  key="errors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        Recent Error Logs (audit_logs)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {errorLogsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : errorLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                          No error logs found. All clear!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {errorLogs.map((entry) => (
                            <div key={entry.id} className="p-3 rounded-lg border border-glass-border bg-red-500/5">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive" className="text-[10px]">{entry.action}</Badge>
                                  <span className="text-[10px] text-muted-foreground">{timeAgo(entry.created_at)}</span>
                                </div>
                                <code className="text-[9px] text-muted-foreground font-mono">
                                  {entry.id.substring(0, 8)}
                                </code>
                              </div>
                              <p className="text-xs text-red-300">{entry.details?.message || "No message"}</p>
                              <p className="text-[10px] text-muted-foreground mt-1 truncate" title={entry.resource}>
                                {entry.resource}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        About Audit Logging
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Errors are persisted to the <code className="text-[10px] text-primary">audit_logs</code> table in Supabase.
                        The <code className="text-[10px] text-primary">lib/error-logger.ts</code> module automatically captures
                        and stores errors from API routes. Stale entries older than 30 days are automatically purged.
                        To view the raw logs, access the{" "}
                        <code className="text-[10px] text-primary">audit_logs</code> table in the Supabase Dashboard.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
