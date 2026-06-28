"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/workspace/sidebar";
import { OverviewTab } from "@/components/workspace/overview-tab";
import { VerdictTab } from "@/components/workspace/verdict-tab";
import { WebsiteTab } from "@/components/workspace/website-tab";
import { BrandTab } from "@/components/workspace/brand-tab";
import { ICPTab } from "@/components/workspace/icp-tab";
import { RevenueTab } from "@/components/workspace/revenue-tab";
import { RoadmapTab } from "@/components/workspace/roadmap-tab";
import { RoastTab } from "@/components/workspace/roast-tab";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAuth } from "@/lib/contexts/auth-context";
import { useStartup, useBlueprint } from "@/lib/hooks/use-startup";
import { Menu, X, AlertTriangle, LayoutDashboard, RefreshCw, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { StartupBlueprint } from "@/lib/types";
import { normalizeBlueprint } from "@/lib/utils/blueprint";
import { getStartupIdFromUrl, getPersistedStartupId, persistStartupId } from "@/lib/utils/startup-utils";

const tabComponents: Record<string, React.ComponentType<{ blueprint?: StartupBlueprint | null }>> = {
  overview: OverviewTab,
  verdict: VerdictTab,
  website: WebsiteTab,
  brand: BrandTab,
  icp: ICPTab,
  revenue: RevenueTab,
  roadmap: RoadmapTab,
  roast: RoastTab,
};

const mobileTabs = [
  { id: "overview", label: "Overview" },
  { id: "verdict", label: "Verdict" },
  { id: "website", label: "Website" },
  { id: "brand", label: "Brand" },
  { id: "icp", label: "ICP" },
  { id: "revenue", label: "Revenue" },
  { id: "roadmap", label: "Roadmap" },
  { id: "roast", label: "Roast" },
];

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const startupIdFromUrl = searchParams.get("id");
  const startupIdFromUrlFallback = getStartupIdFromUrl();
  const startupIdParam = startupIdFromUrl || startupIdFromUrlFallback;
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const [paramsReady, setParamsReady] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    setParamsReady(true);
    console.log("[Workspace] Mounted | startupIdParam:", startupIdParam, "| fromURL:", startupIdFromUrl, "| fallback:", startupIdFromUrlFallback);
  }, []);

  useEffect(() => {
    console.log("[Workspace] startupIdParam changed:", startupIdParam);
    if (startupIdParam) {
      persistStartupId(startupIdParam);
      console.log("[Workspace] Persisted startupId to localStorage:", startupIdParam);
    }
  }, [startupIdParam]);

  const { data: startup, isLoading: startupLoading, isError: startupError, error: startupQueryError, refetch: refetchStartup } = useStartup(startupIdParam);
  const { data: blueprintData, isLoading: blueprintLoading, isError: blueprintError, error: blueprintQueryError, isFetching: blueprintFetching, refetch: refetchBlueprint } = useBlueprint(startupIdParam);

  const rawBlueprint = blueprintData?.blueprint || (startup?.blueprint as { id?: string; content?: unknown } | undefined) || undefined;
  const blueprint = normalizeBlueprint(rawBlueprint as Parameters<typeof normalizeBlueprint>[0]) || undefined;
  const isLoading = startupLoading || blueprintLoading;

  console.log("[Workspace] State:", {
    startupIdParam,
    startupId: startup?.id,
    startupName: startup?.name,
    blueprintDataId: blueprintData?.id,
    hasStartupBlueprint: !!startup?.blueprint,
    hasBlueprintData: !!blueprintData,
    hasNormalizedBlueprint: !!blueprint,
    startupLoading,
    blueprintLoading,
    startupError,
    blueprintError,
    blueprintFetching,
    isLoading,
    paramsReady,
  });

  useEffect(() => {
    if (!startupIdParam && paramsReady && !redirectAttempted) {
      const persistedId = getPersistedStartupId();
      console.log("[Workspace] No startupId in URL | persistedId:", persistedId);
      if (persistedId) {
        setRedirectAttempted(true);
        console.log("[Workspace] Redirecting to persisted startup:", persistedId);
        window.location.href = `/workspace?id=${persistedId}`;
      }
    }
  }, [startupIdParam, paramsReady, redirectAttempted]);

  const retryBlueprint = useCallback(() => {
    console.log("[Workspace] Manual blueprint retry triggered");
    refetchBlueprint();
  }, [refetchBlueprint]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center" role="status" aria-label="Checking authentication">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isLoading) {
    console.log("[Workspace] Rendering loading state");
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-center space-y-4" role="status" aria-label="Loading">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-sm text-muted-foreground font-mono">loading workspace...</p>
        </div>
      </div>
    );
  }

  const noBlueprint = !blueprint;

  if (noBlueprint && startupIdParam) {
    console.log("[Workspace] Has startupId but no blueprint | startupError:", startupError, "| blueprintError:", blueprintError, "| blueprintFetching:", blueprintFetching);

    if (startupError) {
      console.log("[Workspace] Startup fetch failed — showing error");
      const is401 = (startupQueryError as { status?: number })?.status === 401;
      return (
        <div className="flex min-h-screen bg-background items-center justify-center p-8">
          <Card className={`max-w-md w-full border-border bg-card`}>
            <CardContent className="flex flex-col items-center text-center p-6 space-y-3">
              <AlertTriangle className={`h-10 w-10 ${is401 ? "text-warning" : "text-destructive"}`} />
              <h2 className="text-lg font-bold">{is401 ? "Authentication required" : "Could not load startup"}</h2>
              <p className="text-sm text-muted-foreground">
                {is401 ? "Your session has expired. Please sign in again." : "There was a problem fetching your startup data. Please try again."}
              </p>
              {!is401 && (
                <Button variant="outline" onClick={() => { refetchStartup(); }} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Retry
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (blueprintError) {
      console.log("[Workspace] Blueprint fetch failed - showing retry card");
      const is401 = (blueprintQueryError as { status?: number })?.status === 401;
      return (
        <div className="flex min-h-screen bg-background items-center justify-center p-8">
          <Card className={`max-w-md w-full ${is401 ? "border-amber-500/30 bg-amber-500/5" : "border-warning/30 bg-surface-amber"}`}>
            <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
              <AlertTriangle className={`h-10 w-10 ${is401 ? "text-warning" : "text-warning"}`} />
              <h2 className="text-lg font-bold">{is401 ? "Authentication required" : "Could not load blueprint"}</h2>
              <p className="text-sm text-muted-foreground">
                {is401 ? "Your session has expired. Please sign in again." : "We found your startup but had trouble loading the blueprint data. This can happen after a fresh generation."}
              </p>
              {is401 ? null : (
                <div className="flex gap-3 mt-2">
                  <Button variant="outline" onClick={retryBlueprint} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Retry
                  </Button>
                  {startupIdParam && (
                    <Button variant="ghost" onClick={() => { refetchStartup(); retryBlueprint(); }} className="gap-2">
                      <RefreshCw className="h-4 w-4" /> Fetch from startup
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (blueprintFetching) {
      console.log("[Workspace] Blueprint still refetching - showing retry loading");
      return (
        <div className="flex min-h-screen bg-background items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground font-mono">retying blueprint fetch...</p>
          </div>
        </div>
      );
    }

    console.log("[Workspace] No blueprint found for this startup - showing create prompt");
    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold font-mono">$ blueprint --not-found</h2>
          <p className="text-sm text-muted-foreground">
            This startup doesn&apos;t have a blueprint yet. Complete the founder interview to generate one.
          </p>
          <Link href="/interview">
            <Button variant="default"><LayoutDashboard className="h-4 w-4" /> Complete Interview</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (noBlueprint && !startupIdParam && paramsReady) {
    const persistedId = getPersistedStartupId();
    console.log("[Workspace] No startupId and no blueprint | paramsReady:", paramsReady, "| persistedId:", persistedId);

    if (persistedId && !redirectAttempted) {
      console.log("[Workspace] Delayed redirect to persisted startup:", persistedId);
    }

    console.log("[Workspace] Showing empty state");
    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold font-mono">$ startup --not-selected</h2>
          <p className="text-sm text-muted-foreground">Select a startup from your list or create a new one to get started.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/blueprints">
              <Button variant="outline">My Startups</Button>
            </Link>
            <Link href="/interview">
              <Button variant="default"><LayoutDashboard className="h-4 w-4" /> New Interview</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ActiveComponent = tabComponents[activeTab] || tabComponents.overview;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setMobileNavOpen(false); }}
        founderName={startup?.name || blueprint?.startupName || ""}
        startupId={startupIdParam || undefined}
        blueprint={blueprint}
      />

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-border bg-card">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileNavOpen} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Image src="/logo-square.png" alt="StartupOS" width={1254} height={1254} className="h-6 w-6" />
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary" aria-label="Exit workspace">Exit</Link>
        </div>
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-border overflow-hidden">
              <div className="grid grid-cols-2 gap-1 p-3">
                {mobileTabs.map((tab) => (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false); }} role="tab" aria-selected={activeTab === tab.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${activeTab === tab.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="lg:hidden fixed top-14 left-0 right-0 z-30 border-b border-border bg-card overflow-x-auto">
        <div className="flex gap-1 p-2">
          {mobileTabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false); }} role="tab" aria-selected={activeTab === tab.id}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 min-h-screen lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-8 pb-16">
          {blueprint && !user && (
            <div className="flex items-center justify-end gap-2 mb-4">
              <Link href="/auth/sign-up" className="text-xs text-muted-foreground hover:text-primary transition-colors">Sign up to save this blueprint →</Link>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {blueprint ? (
                <ErrorBoundary key={activeTab}>
                  <ActiveComponent blueprint={blueprint} />
                </ErrorBoundary>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen bg-background items-center justify-center" role="status" aria-label="Loading">
      <div className="text-center space-y-4">
        <div className="relative mx-auto h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-sm text-muted-foreground font-mono">loading workspace...</p>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WorkspaceContent />
    </Suspense>
  );
}
