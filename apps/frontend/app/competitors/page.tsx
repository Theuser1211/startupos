"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/contexts/auth-context";
import { useCompetitors, useAddCompetitor, useCompetitorHistory } from "@/lib/hooks/use-competitors";
import { toFriendlyError } from "@/lib/api/client";
import {
  Loader2, AlertTriangle, ArrowLeft, Plus, ExternalLink,
  ChevronDown, ChevronRight, Clock, Crosshair, FileText,
  TrendingUp, Search, X, Building2, Globe,
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

const CHANGE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  pricing: { label: "Pricing Change", color: "text-amber-400" },
  feature: { label: "Feature Change", color: "text-blue-400" },
  positioning: { label: "Positioning Change", color: "text-purple-400" },
};

function CompetitorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startupId = searchParams.get("startupId") || searchParams.get("id");
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { data: competitors, isLoading, error, refetch } = useCompetitors(startupId);
  const addCompetitorMut = useAddCompetitor();

  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", website: "", description: "" });
  const [formError, setFormError] = useState("");

  const handleSignOut = async () => { await signOut(); router.push("/"); };

  const handleAddCompetitor = async () => {
    if (!startupId) return;
    setFormError("");
    if (!formData.name.trim() || !formData.website.trim()) {
      setFormError("Name and website are required");
      return;
    }
    try {
      await addCompetitorMut.mutateAsync({
        startupId,
        name: formData.name.trim(),
        website: formData.website.trim(),
        description: formData.description.trim() || undefined,
      });
      setFormData({ name: "", website: "", description: "" });
      setShowAddForm(false);
    } catch {
      setFormError("Failed to add competitor");
    }
  };

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

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link href={startupId ? `/dashboard?id=${startupId}` : "/blueprints"} className="inline-flex items-center gap-1 text-sm font-mono text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Crosshair className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Competitor Intelligence</h1>
              <p className="text-sm text-muted-foreground">Track competitors and detect changes over time</p>
            </div>
          </div>
          <Button size="sm" className="glow-green-btn text-xs font-mono" onClick={() => { setShowAddForm(!showAddForm); setFormError(""); }}>
            <Plus className="h-4 w-4" /> Add Competitor
          </Button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <Card className="terminal-panel border-[rgba(34,197,94,0.12)]">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-mono font-semibold text-primary">Add Competitor</h3>
                    <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="mono-label text-xs">Name *</label>
                      <Input className="terminal-input"
                        placeholder="e.g. Acme Corp"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="mono-label text-xs">Website *</label>
                      <Input className="terminal-input"
                        placeholder="e.g. https://acme.com"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="mono-label text-xs">Description</label>
                    <Textarea className="terminal-input"
                      placeholder="What does this competitor do?"
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  {formError && <p className="text-xs text-red-400">{formError}</p>}
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" className="font-mono text-xs" onClick={() => setShowAddForm(false)}>Cancel</Button>
                    <Button size="sm" className="font-mono text-xs" onClick={handleAddCompetitor} disabled={addCompetitorMut.isPending}>
                      {addCompetitorMut.isPending ? "Adding..." : "Add Competitor"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="font-mono text-sm text-primary animate-pulse">$ loading competitors...</p>
          </div>
        )}

        {error && (
          <Card className="terminal-card border-red-500/30 bg-red-500/5">
            <CardContent className="flex items-center gap-3 p-6">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Failed to load competitors</p>
                <p className="text-xs text-muted-foreground mt-0.5">{toFriendlyError((error as { error?: string })?.error || "An error occurred")}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {!startupId && !isLoading && !error && (
          <Card className="terminal-card border-[rgba(34,197,94,0.12)]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Crosshair className="h-10 w-10 text-primary mb-3" />
              <p className="text-sm font-mono text-muted-foreground">Select a startup to view competitor intelligence</p>
              <Button size="sm" className="mt-4" asChild>
                <Link href="/blueprints">View My Startups</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {competitors && !isLoading && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {competitors.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Card className="terminal-card border-[rgba(34,197,94,0.12)]">
                  <CardContent className="flex flex-col items-center py-16 text-center">
                    <Search className="h-10 w-10 text-primary mb-3" />
                    <p className="text-sm font-mono">No competitors tracked yet</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1 max-w-sm">No competitors tracked yet. Add your first competitor.</p>
                    <Button size="sm" className="mt-4 font-mono text-xs glow-green-btn" onClick={() => setShowAddForm(true)}>
                      <Plus className="h-4 w-4" /> Add Your First Competitor
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              competitors.map((competitor, i) => (
                <motion.div key={competitor.id} variants={itemVariants}>
                  <Card
                    className="terminal-card cursor-pointer hover:border-primary/40 transition-all duration-200"
                    onClick={() => setExpandedId(expandedId === competitor.id ? null : competitor.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{competitor.name}</h3>
                              {competitor.changes.length > 0 && (
                                <Badge className="terminal-badge text-[10px] px-1.5 py-0.5 text-amber-400 border-amber-500/30 bg-amber-500/10">
                                  {competitor.changes.length} change{competitor.changes.length !== 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                            <a
                              href={competitor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="h-3 w-3" />
                              {competitor.website.replace(/https?:\/\//, "")}
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                            {competitor.description && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{competitor.description}</p>
                            )}
                            {competitor.latestSnapshot && (
                              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                <span>{competitor.latestSnapshot.title}</span>
                                <Clock className="h-3 w-3 ml-1" />
                                <span>{new Date(competitor.latestSnapshot.capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground mt-2 transition-transform duration-200 ${expandedId === competitor.id ? "rotate-180" : ""}`} />
                      </div>

                      <AnimatePresence>
                        {expandedId === competitor.id && (
                          <CompetitorDetail competitorId={competitor.id} />
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

function CompetitorDetail({ competitorId }: { competitorId: string }) {
  const { data: history, isLoading } = useCompetitorHistory(competitorId);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="terminal-panel mt-4 pt-4 border-t border-[rgba(34,197,94,0.12)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
        ) : history ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Snapshot History
              </h4>
              {history.snapshots.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">No snapshots yet</p>
              ) : (
                <div className="space-y-0">
                  {history.snapshots.map((snapshot, i) => (
                    <div key={snapshot.id} className="flex items-start gap-3 py-2.5 border-t border-glass-border first:border-t-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5 shrink-0">
                          <FileText className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{snapshot.title}</p>
                        {snapshot.summary && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{snapshot.summary}</p>
                        )}
                        {snapshot.pricing && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-medium">Pricing:</span> {snapshot.pricing}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {new Date(snapshot.capturedAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Detected Changes
              </h4>
              {history.changes.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">No changes detected yet</p>
              ) : (
                <div className="space-y-0">
                  {history.changes.map((change) => {
                    const typeInfo = CHANGE_TYPE_LABELS[change.type] || { label: change.type, color: "text-muted-foreground" };
                    return (
                      <div key={change.id} className="flex items-start gap-3 py-2.5 border-t border-glass-border first:border-t-0">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-opacity-10 mt-0.5 shrink-0 ${change.type === "pricing" ? "bg-amber-500/10" : change.type === "feature" ? "bg-blue-500/10" : "bg-purple-500/10"}`}>
                          <TrendingUp className={`h-3 w-3 ${typeInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${typeInfo.color}`}>{typeInfo.label}</p>
                          <div className="flex items-start gap-2 mt-0.5 text-xs">
                            {change.oldValue && (
                              <span className="line-through text-red-400/70">{change.oldValue}</span>
                            )}
                            {change.newValue && (
                              <span className="text-primary">{change.newValue}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {new Date(change.detectedAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function CompetitorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <CompetitorsContent />
    </Suspense>
  );
}
