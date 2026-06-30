"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/workspace/sidebar";
import { OverviewTab } from "@/components/workspace/overview-tab";
import { WebsiteTab } from "@/components/workspace/website-tab";
import { BrandTab } from "@/components/workspace/brand-tab";
import { ICPTab } from "@/components/workspace/icp-tab";
import { RevenueTab } from "@/components/workspace/revenue-tab";
import { RoadmapTab } from "@/components/workspace/roadmap-tab";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAuth } from "@/lib/contexts/auth-context";
import { useStartup, useBlueprint } from "@/lib/hooks/use-startup";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { StartupBlueprint, Startup as StartupType } from "@/lib/types";
import { normalizeBlueprint } from "@/lib/utils/blueprint";
import { getStartupIdFromUrl, persistStartupId } from "@/lib/utils/startup-utils";
import { apiClient, type ApiError } from "@/lib/api/client";
import { isGuest, getGuestStartup, getGuestBlueprint, getGuestStartupId } from "@/lib/utils/guest";

const tabComponents: Record<string, React.ComponentType<{ blueprint?: StartupBlueprint | null }>> = {
  overview: OverviewTab,
  website: WebsiteTab,
  brand: BrandTab,
  icp: ICPTab,
  revenue: RevenueTab,
  roadmap: RoadmapTab,
};

const mobileTabs = [
  { id: "overview", label: "Overview" },
  { id: "website", label: "Website" },
  { id: "brand", label: "Brand" },
  { id: "icp", label: "ICP" },
  { id: "revenue", label: "Revenue" },
  { id: "roadmap", label: "Roadmap" },
];

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const startupIdFromUrl = searchParams.get("id");
  const startupIdFromUrlFallback = getStartupIdFromUrl();
  const startupIdParam = startupIdFromUrl || startupIdFromUrlFallback;
  const [activeTab, setActiveTab] = useState("overview");
  const { user, isLoading: authLoading } = useAuth();
  const [paramsReady, setParamsReady] = useState(false);

  const hasToken = !!apiClient.getToken();
  const guestMode = isGuest() && !hasToken;
  const guestRecoveryId = !startupIdParam && guestMode ? getGuestStartupId() : null;
  const effectiveStartupId = startupIdParam || guestRecoveryId || null;

  const [guestStartup, setGuestStartup] = useState<StartupType | null>(null);
  const [guestBlueprintObj, setGuestBlueprintObj] = useState<StartupBlueprint | null>(null);
  const [guestReady, setGuestReady] = useState(false);

  useEffect(() => {
    setParamsReady(true);
  }, []);

  useEffect(() => {
    if (guestMode && effectiveStartupId) {
      const gs = getGuestStartup(effectiveStartupId);
      const gb = getGuestBlueprint(effectiveStartupId);
      setGuestStartup(gs);
      setGuestBlueprintObj(gb);
    }
    setGuestReady(true);
  }, [effectiveStartupId, guestMode]);

  useEffect(() => {
    if (startupIdParam) {
      persistStartupId(startupIdParam);
    }
  }, [startupIdParam]);

  const { data: startup, isLoading: startupLoading, isError: startupError, error: startupQueryError, refetch: refetchStartup } = useStartup(guestMode ? null : effectiveStartupId);
  const { data: blueprintData, isLoading: blueprintLoading, isError: blueprintError, error: blueprintQueryError, isFetching: blueprintFetching, refetch: refetchBlueprint } = useBlueprint(guestMode ? null : effectiveStartupId);

  const rawBlueprint = guestMode ? null : (blueprintData?.blueprint || (startup?.blueprint as { id?: string; content?: unknown } | undefined) || undefined);
  const apiBlueprint = guestMode ? null : (normalizeBlueprint(rawBlueprint as Parameters<typeof normalizeBlueprint>[0]) || undefined);
  const blueprint = guestMode ? guestBlueprintObj : apiBlueprint;
  const startupInfo = guestMode ? guestStartup : startup;
  const isLoading = guestMode ? false : (startupLoading || blueprintLoading);

  const retryBlueprint = useCallback(() => {
    refetchBlueprint();
  }, [refetchBlueprint]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (guestMode && !guestReady) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const noBlueprint = !blueprint;

  if (noBlueprint && startupIdParam) {
    const is401 = (startupQueryError as unknown as ApiError)?.status === 401;
    const tokenExisted = (startupQueryError as unknown as ApiError)?.tokenExisted;

    if (is401) {
      apiClient.clearToken();
      if (typeof window !== "undefined") {
        window.location.href = `/auth/sign-in?expired=1&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }
      return (
        <div className="flex min-h-screen bg-background items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      );
    }

    if (startupError) {
      return (
        <div className="flex min-h-screen bg-background items-center justify-center p-8">
          <Card className="max-w-md w-full">
            <CardContent className="flex flex-col items-center text-center p-6 space-y-3">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <h2 className="text-lg font-bold">Could not load startup</h2>
              <p className="text-sm text-muted-foreground">
                There was a problem fetching your startup data. Please try again.
              </p>
              <Button variant="outline" onClick={() => { refetchStartup(); }} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (blueprintError) {
      return (
        <div className="flex min-h-screen bg-background items-center justify-center p-8">
          <Card className="max-w-md w-full">
            <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
              <AlertTriangle className="h-10 w-10 text-warning" />
              <h2 className="text-lg font-bold">Could not load blueprint</h2>
              <p className="text-sm text-muted-foreground">
                We found your startup but had trouble loading the blueprint data.
              </p>
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
            </CardContent>
          </Card>
        </div>
      );
    }

    if (blueprintFetching) {
      return (
        <div className="flex min-h-screen bg-background items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      );
    }

    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <h2 className="text-lg font-bold font-mono">No blueprint yet</h2>
          <p className="text-sm text-muted-foreground">
            This startup doesn&apos;t have a blueprint yet. Complete the founder interview to generate one.
          </p>
          <Link href="/interview">
            <Button variant="default">Complete Interview</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (noBlueprint && !effectiveStartupId && paramsReady) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <h2 className="text-lg font-bold font-mono">No startup selected</h2>
          <p className="text-sm text-muted-foreground">Select a startup from your list or create a new one to get started.</p>
          <div className="flex gap-3 justify-center">
            {guestMode ? (
              <Link href="/interview">
                <Button variant="default">New Interview</Button>
              </Link>
            ) : (
              <>
                <Link href="/blueprints">
                  <Button variant="outline">My Startups</Button>
                </Link>
                <Link href="/interview">
                  <Button variant="default">New Interview</Button>
                </Link>
              </>
            )}
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
        onTabChange={(tab) => { setActiveTab(tab); }}
        founderName={startupInfo?.name || blueprint?.startupName || ""}
        startupId={effectiveStartupId || undefined}
        blueprint={blueprint}
      />

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-border bg-card overflow-x-auto">
        <div className="flex gap-1 p-2">
          {mobileTabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); }} role="tab" aria-selected={activeTab === tab.id}
              className={`shrink-0 rounded px-3 py-1.5 text-xs font-mono whitespace-nowrap ${activeTab === tab.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 min-h-screen lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-8 pb-16">
          {blueprint && !hasToken && (
            <div className="flex items-center justify-between gap-2 mb-4 px-3 py-2 rounded border border-amber-500/20">
              <p className="text-xs text-muted-foreground font-mono">Guest mode - blueprint saved locally</p>
              <Link href="/auth/sign-up" className="text-xs text-primary hover:text-primary/80 font-mono shrink-0">
                Sign up to save
              </Link>
            </div>
          )}

          <div key={activeTab}>
            {blueprint ? (
              <ErrorBoundary key={activeTab}>
                <ActiveComponent blueprint={blueprint} />
              </ErrorBoundary>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen bg-background items-center justify-center">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
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
