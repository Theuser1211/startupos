"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { ToastProvider, useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/supabase/auth-context";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Menu, X, ChevronRight, AlertTriangle, Loader2, LayoutDashboard, BookmarkCheck, Cloud, RefreshCw } from "lucide-react";
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
  const { blueprint, isLoading, error, loadSavedBlueprint } = useBlueprint();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [publishStatus, setPublishStatus] = useState<{ isPublished: boolean; shareToken: string | null }>({ isPublished: false, shareToken: null });
  const [isPublishing, setIsPublishing] = useState(false);

  // Refs to track save state across renders (avoid stale closure issues)
  const savedBlueprintIdRef = useRef<string | null>(null);
  const lastSavedRef = useRef<number>(0);
  const isSavingRef = useRef(false);
  const updateProfileRef = useRef(updateProfile);
  useEffect(() => {
    updateProfileRef.current = updateProfile;
  }, [updateProfile]);

  // Load saved blueprint from Supabase if ?id= param is present,
  // otherwise try to load the most recent blueprint for this user
  useEffect(() => {
    if (blueprintId) {
      loadSavedBlueprint(blueprintId);
    } else if (user) {
      // No ?id= — check if user has a recent blueprint in Supabase
      (async () => {
        try {
          const res = await fetch("/api/blueprints");
          if (res.ok) {
            const blueprints = await res.json();
            if (blueprints?.length > 0) {
              // Track this ID for auto-save and load the blueprint
              savedBlueprintIdRef.current = blueprints[0].id;
              loadSavedBlueprint(blueprints[0].id);
            }
          }
        } catch {
          // Best-effort — fall through to localStorage generation
        }
      })();
    }
  }, [blueprintId, user]);

  // Once a saved blueprint is loaded, track its ID for subsequent auto-saves
  useEffect(() => {
    if (blueprintId && !savedBlueprintIdRef.current) {
      savedBlueprintIdRef.current = blueprintId;
    }
  }, [blueprintId]);

  // Fetch publish status when blueprint loads
  useEffect(() => {
    if (!blueprintId || !user) return;
    (async () => {
      try {
        const res = await fetch(`/api/blueprints?id=${blueprintId}`);
        if (res.ok) {
          const data = await res.json();
          setPublishStatus({
            isPublished: data.visibility === "public",
            shareToken: data.share_token ?? null,
          });
        }
      } catch {
        // Best-effort — ignore fetch failure
      }
    })();
  }, [blueprintId, user]);

  const handlePublishToggle = useCallback(async () => {
    if (!blueprintId) return;
    setIsPublishing(true);
    try {
      const action = publishStatus.isPublished ? "unpublish" : "publish";
      const res = await fetch("/api/blueprints/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blueprintId, action }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublishStatus({
          isPublished: data.visibility === "public",
          shareToken: data.share_token ?? null,
        });
        toast({
          title: action === "publish" ? "Blueprint published" : "Blueprint unpublished",
          message: action === "publish"
            ? "Your blueprint is now publicly viewable."
            : "Your blueprint is no longer public.",
          variant: "success",
        });
      } else {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        toast({ title: "Publish failed", message: err.error || "Could not update publish status.", variant: "error" });
      }
    } catch {
      toast({ title: "Publish failed", message: "A network error occurred.", variant: "error" });
    } finally {
      setIsPublishing(false);
    }
  }, [blueprintId, publishStatus.isPublished, toast]);

  // Core save function — used by both manual save and auto-save
  const performSave = useCallback(async (isAuto: boolean): Promise<boolean> => {
    if (!blueprint || !user) return false;
    if (isSavingRef.current) return false;

    isSavingRef.current = true;
    if (isAuto) {
      setAutoSaveStatus("saving");
    } else {
      setIsSaving(true);
    }

    try {
      const stored = localStorage.getItem("startupos-founder");
      const interviewData = stored ? JSON.parse(stored) : {};
      const ideaText = interviewData.idea || blueprint.startupName || "";

      let id = savedBlueprintIdRef.current;

      // First save — need to find or create the blueprint
      if (!id) {
        // Check if a blueprint with this idea already exists
        const existingRes = await fetch(`/api/blueprints?idea=${encodeURIComponent(ideaText)}`);
        const existing = existingRes.ok ? await existingRes.json() : null;

        if (existing?.id) {
          id = existing.id;
          savedBlueprintIdRef.current = id;
        }
      }

      let res: Response;
      if (id) {
        // Update existing blueprint
        res = await fetch("/api/blueprints", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
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
        const data = await res.json();
        // After creation, store the ID so subsequent saves use PUT
        if (!savedBlueprintIdRef.current && data?.id) {
          savedBlueprintIdRef.current = data.id;
          id = data.id;
        }

        lastSavedRef.current = Date.now();

        if (isAuto) {
          setAutoSaveStatus("saved");
        }

        // Save interview data to user profile (best-effort)
        try {
          updateProfileRef.current({
            settings: {
              lastInterview: interviewData,
              lastBlueprintName: blueprint.startupName,
              lastBlueprintId: savedBlueprintIdRef.current,
            },
          });
        } catch {
          // Profile save is best-effort
        }

        return true;
      }

      if (isAuto) {
        setAutoSaveStatus("error");
      }
      return false;
    } catch {
      if (isAuto) {
        setAutoSaveStatus("error");
      } else {
        toast({ title: "Save failed", message: "Could not save blueprint. Check your connection.", variant: "error" });
      }
      return false;
    } finally {
      isSavingRef.current = false;
      if (!isAuto) {
        setIsSaving(false);
      }
    }
  }, [blueprint, user, toast]);

  // Auto-save on tab change
  useEffect(() => {
    if (!blueprint || !user) return;
    // Debounce: wait 500ms after tab switch to avoid rapid saves
    const timer = setTimeout(() => {
      performSave(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTab, blueprint, user, performSave]);

  // Periodic auto-save every 30 seconds
  useEffect(() => {
    if (!blueprint || !user) return;

    const interval = setInterval(() => {
      // Only save if at least 5 seconds have passed since last save
      // (prevents redundant saves when tab-switch just saved)
      if (Date.now() - lastSavedRef.current < 5000) return;
      performSave(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [blueprint, user, performSave]);

  // Save on page unload/navigation away
  const blueprintRef = useRef(blueprint);
  useEffect(() => {
    blueprintRef.current = blueprint;
  }, [blueprint]);

  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      const currentBlueprint = blueprintRef.current;
      if (!currentBlueprint || isSavingRef.current) return;

      try {
        const stored = localStorage.getItem("startupos-founder");
        if (!stored) return;

        const interviewData = JSON.parse(stored);
        navigator.sendBeacon("/api/blueprints/autosave", JSON.stringify({
          id: savedBlueprintIdRef.current,
          blueprint: currentBlueprint,
          interview_data: interviewData,
        }));
      } catch {
        // Best-effort — silently ignore
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user]);

  // Reset save status indicator after "saved" shows for 3s
  useEffect(() => {
    if (autoSaveStatus === "saved") {
      const timer = setTimeout(() => {
        setAutoSaveStatus("idle");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoSaveStatus]);

  // Manual save handler (for the retry/force-save button)
  const handleSaveBlueprint = async () => {
    await performSave(false);
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
        blueprintId={blueprintId || savedBlueprintIdRef.current || undefined}
        isPublished={publishStatus.isPublished}
        shareToken={publishStatus.shareToken}
        onPublishToggle={handlePublishToggle}
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

          <Image
            src="/logo-square.png"
            alt="StartupOS"
            width={1254}
            height={1254}
            className="h-6 w-6"
          />

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
          {/* Auto-save / sign-up-to-save indicator */}
          {blueprint && user && (
            <div className="flex items-center justify-end gap-2 mb-4">
              {autoSaveStatus === "saving" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Cloud className="h-3 w-3 animate-pulse" />
                  Auto-saving...
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <BookmarkCheck className="h-3 w-3" />
                  Auto-saved
                </span>
              )}
              {autoSaveStatus === "error" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3" />
                    Save failed
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveBlueprint}
                    disabled={isSaving}
                    className="text-xs h-6 px-2 gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </Button>
                </div>
              )}
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
