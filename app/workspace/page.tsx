"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/workspace/sidebar";
import { OverviewTab } from "@/components/workspace/overview-tab";
import { VerdictTab } from "@/components/workspace/verdict-tab";
import { WebsiteTab } from "@/components/workspace/website-tab";
import { BrandTab } from "@/components/workspace/brand-tab";
import { LogoTab } from "@/components/workspace/logo-tab";
import { ICPTab } from "@/components/workspace/icp-tab";
import { RevenueTab } from "@/components/workspace/revenue-tab";
import { RoadmapTab } from "@/components/workspace/roadmap-tab";
import { RoastTab } from "@/components/workspace/roast-tab";
import { BlueprintProvider, useBlueprint } from "@/lib/startup/blueprint-context";
import { ToastProvider } from "@/components/ui/toast";
import { useAuth } from "@/lib/supabase/auth-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Menu, X, Sparkles, ChevronRight, AlertTriangle, Loader2, LayoutDashboard, BookmarkPlus, BookmarkCheck } from "lucide-react";
import Link from "next/link";

const tabComponents: Record<string, React.ComponentType> = {
  overview: OverviewTab,
  verdict: VerdictTab,
  website: WebsiteTab,
  brand: BrandTab,
  logo: LogoTab,
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
  { id: "logo", label: "Logo" },
  { id: "icp", label: "ICP" },
  { id: "revenue", label: "Revenue" },
  { id: "roadmap", label: "Roadmap" },
  { id: "roast", label: "Roast" },
];

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const blueprintId = searchParams.get("id");
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, updateProfile } = useAuth();
  const { blueprint, isLoading, error, generationStatus, loadSavedBlueprint } = useBlueprint();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load saved blueprint from Supabase if ?id= param is present
  useEffect(() => {
    if (blueprintId) {
      loadSavedBlueprint(blueprintId);
    }
  }, [blueprintId]);

  const handleSaveBlueprint = async () => {
    if (!blueprint || !user) return;
    setIsSaving(true);
    try {
      const stored = localStorage.getItem("startupos-founder");
      const interviewData = stored ? JSON.parse(stored) : {};
      const ideaText = interviewData.idea || blueprint.startupName || "";

      // Check if a blueprint with this idea already exists (prevents duplicates)
      const existingRes = await fetch(`/api/blueprints?idea=${encodeURIComponent(ideaText)}`);
      const existing = existingRes.ok ? await existingRes.json() : null;

      let res;
      if (existing?.id) {
        // Update existing blueprint
        res = await fetch("/api/blueprints", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existing.id,
            name: blueprint.startupName || "My Startup",
            blueprint,
            interview_data: interviewData,
          }),
        });
      } else {
        // Create new blueprint
        res = await fetch("/api/blueprints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: blueprint.startupName || "My Startup",
            idea: ideaText,
            industry: interviewData.industry || "other",
            stage: interviewData.stage || "ideation",
            blueprint,
            interview_data: interviewData,
          }),
        });
      }

      if (res.ok) {
        setIsSaved(true);

        // Also save interview data to user profile settings for cross-device access
        try {
          await updateProfile({
            settings: {
              lastInterview: interviewData,
              lastBlueprintName: blueprint.startupName,
              lastBlueprintId: existing?.id || null,
            },
          });
        } catch {
          // Profile save is best-effort
        }
      }
    } catch {
      console.warn("Failed to save blueprint");
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state — skeleton already handled by loading.tsx, but show spinner for regeneration
  if (isLoading && !blueprint) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !blueprint) {
    const isAuthError = error.toLowerCase().includes("sign in");
    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-display font-bold">
            {isAuthError ? "Sign in required" : "No blueprint yet"}
          </h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-3 justify-center">
            {isAuthError ? (
              <Link
                href={`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
              >
                <Button variant="default">
                  <LayoutDashboard className="h-4 w-4" />
                  Sign in to access this blueprint
                </Button>
              </Link>
            ) : (
              <Link href="/interview">
                <Button variant="default">
                  <LayoutDashboard className="h-4 w-4" />
                  Complete Interview
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const ActiveComponent = tabComponents[activeTab] || tabComponents.overview;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setMobileNavOpen(false);
        }}
        founderName={blueprint?.startupName || ""}
      />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-strong border-b border-glass-border">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileNavOpen}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-glass-border text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold">
              Startup<span className="text-primary">OS</span>
            </span>
          </div>

          <Link href="/" className="text-xs text-muted-foreground hover:text-primary" aria-label="Exit workspace">
            Exit
          </Link>
        </div>

        {/* Mobile Tab Selector */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-glass-border overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-1 p-3">
                {mobileTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileNavOpen(false);
                    }}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <ChevronRight className={`h-3 w-3 ${activeTab === tab.id ? "text-primary" : ""}`} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Tab Scroller */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-30 glass border-b border-glass-border overflow-x-auto">
        <div className="flex gap-1 p-2">
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileNavOpen(false);
              }}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-screen lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-8 pb-16">
          {/* Save to account banner */}
          {blueprint && user && !isSaved && (
            <div className="flex items-center justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveBlueprint}
                disabled={isSaving}
                className="text-xs gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <BookmarkPlus className="h-3 w-3" />
                )}
                Save to My Blueprints
              </Button>
            </div>
          )}
          {blueprint && user && isSaved && (
            <div className="flex items-center justify-end gap-2 mb-4">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                <BookmarkCheck className="h-3 w-3" />
                Saved to your blueprints
              </span>
            </div>
          )}
          {blueprint && !user && (
            <div className="flex items-center justify-end gap-2 mb-4">
              <Link href="/auth/sign-up" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Sign up to save this blueprint →
              </Link>
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
                  <ActiveComponent />
                </ErrorBoundary>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <BlueprintProvider>
      <ToastProvider>
        <WorkspaceContent />
      </ToastProvider>
    </BlueprintProvider>
  );
}
