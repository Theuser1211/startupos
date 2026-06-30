"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/contexts/auth-context";
import { useCompetitors, useAddCompetitor } from "@/lib/hooks/use-competitors";
import { toFriendlyError, apiClient, type ApiError } from "@/lib/api/client";
import {
  Loader2, AlertTriangle, ArrowLeft, Plus,
  X, Building2, Globe, ExternalLink,
} from "lucide-react";
import { persistStartupId } from "@/lib/utils/startup-utils";

function CompetitorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startupId = searchParams.get("startupId") || searchParams.get("id");
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { data: competitors, isLoading, error, refetch } = useCompetitors(startupId);
  const addCompetitorMut = useAddCompetitor();

  const [showAddForm, setShowAddForm] = useState(false);
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
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-mono font-medium">StartupOS</Link>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Link href="/blueprints" className="text-xs font-mono text-muted-foreground hover:text-foreground">My Startups</Link>
                <button onClick={handleSignOut} className="text-xs font-mono text-muted-foreground hover:text-foreground">Sign out</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href={startupId ? `/dashboard?id=${startupId}` : "/blueprints"} className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3 w-3" /> Back
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-base font-semibold font-mono">Competitors</h1>
          <Button size="sm" className="font-mono text-xs" onClick={() => { setShowAddForm(!showAddForm); setFormError(""); }}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>

        {showAddForm && (
          <div className="border border-border rounded p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono">Add competitor</h3>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="text-xs" />
              <Input placeholder="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="text-xs" />
            </div>
            <Input placeholder="Description (optional)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="text-xs" />
            {formError && <p className="text-xs text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="font-mono text-xs" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button size="sm" className="font-mono text-xs" onClick={handleAddCompetitor} disabled={addCompetitorMut.isPending}>
                {addCompetitorMut.isPending ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        )}

        {!apiClient.getToken() ? (
          <div className="border border-border rounded p-8 text-center">
            <p className="text-sm text-muted-foreground font-mono">Sign in to track competitors.</p>
            <Button size="sm" className="mt-4 font-mono text-xs" asChild>
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className={`border rounded p-4 ${(error as unknown as ApiError).status === 401 ? "border-amber-500/30" : "border-red-500/30"}`}>
            <p className="text-sm font-medium">{(error as unknown as ApiError).status === 401 ? "Authentication required" : "Failed to load competitors"}</p>
            <p className="text-xs text-muted-foreground mt-1">{toFriendlyError((error as unknown as ApiError).error || "An error occurred")}</p>
            {(error as unknown as ApiError).status !== 401 && (
              <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-2 font-mono text-xs">Retry</Button>
            )}
          </div>
        ) : !startupId ? (
          <div className="border border-border rounded p-8 text-center">
            <p className="text-sm text-muted-foreground font-mono">Select a startup to view competitors.</p>
            <Button size="sm" className="mt-4 font-mono text-xs" asChild>
              <Link href="/blueprints">View Startups</Link>
            </Button>
          </div>
        ) : !competitors || competitors.length === 0 ? (
          <div className="border border-border rounded p-8 text-center">
            <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-mono">No competitors tracked yet.</p>
            <Button size="sm" className="mt-4 font-mono text-xs" onClick={() => setShowAddForm(true)}>
              <Plus className="h-3 w-3" /> Add competitor
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {competitors.map((competitor) => (
              <Card key={competitor.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Building2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium">{competitor.name}</h3>
                        <a href={competitor.website} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-0.5"
                        >
                          <Globe className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">{competitor.website.replace(/https?:\/\//, "")}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {competitor.description && (
                    <p className="text-xs text-muted-foreground mt-3">{competitor.description}</p>
                  )}

                  {competitor.latestSnapshot && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-xs font-mono font-medium">{competitor.latestSnapshot.title}</p>
                      {competitor.latestSnapshot.summary && (
                        <p className="text-xs text-muted-foreground mt-1">{competitor.latestSnapshot.summary}</p>
                      )}
                      {competitor.latestSnapshot.pricing && (
                        <p className="text-xs text-muted-foreground mt-1">Pricing: {competitor.latestSnapshot.pricing}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(competitor.latestSnapshot.capturedAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  {competitor.changes && competitor.changes.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {competitor.changes.length} change{competitor.changes.length !== 1 ? "s" : ""} detected
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
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
