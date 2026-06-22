"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { useGenerateWebsite, useWebsite, useDeploy } from "@/lib/hooks/use-startup";
import { pollJob } from "@/lib/api/jobs";
import type { Website } from "@/lib/types";
import {
  Globe, ExternalLink, Check, X, Sparkles, Loader2,
  Rocket, RotateCw, Clock, Search, Shield,
} from "lucide-react";
import type { StartupBlueprint } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type GenPhase = "idle" | "queued" | "generating" | "completed" | "failed";

export function WebsiteTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  const [genPhase, setGenPhase] = useState<GenPhase>("idle");
  const [genJobId, setGenJobId] = useState<string | null>(null);
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [websiteData, setWebsiteData] = useState<Website | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const { toast } = useToast();
  const generateWebsiteMut = useGenerateWebsite();
  const deployMut = useDeploy();
  const { data: refetchedWebsite } = useWebsite(genPhase === "completed" ? websiteId : null);

  const handleGenerate = useCallback(async () => {
    if (!blueprint?.startupName) {
      toast({ variant: "error", title: "No blueprint data", message: "Complete the interview first." });
      return;
    }
    setGenPhase("queued");
    setGenError(null);
    setWebsiteData(null);
    try {
      const startupId = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("id")
        : null;
      if (!startupId) {
        throw new Error("No startup ID found");
      }
      const res = await generateWebsiteMut.mutateAsync({ startupId });
      if (res.jobId) {
        setGenJobId(res.jobId);
        setGenPhase("generating");
      } else if (res.websiteId) {
        setWebsiteId(res.websiteId);
        setGenPhase("completed");
      }
    } catch (err) {
      setGenPhase("failed");
      setGenError(err instanceof Error ? err.message : "Failed to start website generation.");
      toast({ variant: "error", title: "Generation failed" });
    }
  }, [blueprint, generateWebsiteMut, toast]);

  useEffect(() => {
    if (genPhase !== "generating" || !genJobId) return;
    let cancelled = false;
    setIsPolling(true);

    (async () => {
      try {
        const job = await pollJob(genJobId, { maxAttempts: 120, intervalMs: 2000 });
        if (cancelled) return;
        if (job.status === "completed") {
          const result = job.result as { websiteId?: string } | undefined;
          const wId = result?.websiteId;
          if (wId) {
            setWebsiteId(wId);
            setGenPhase("completed");
          } else {
            setGenPhase("failed");
            setGenError("Website ID not found in job result");
            toast({ variant: "error", title: "Generation failed", message: "Website ID not found." });
          }
        } else {
          setGenPhase("failed");
          setGenError(job.error || "Website generation failed");
          toast({ variant: "error", title: "Generation failed" });
        }
      } catch (err) {
        if (!cancelled) {
          setGenPhase("failed");
          setGenError(err instanceof Error ? err.message : "Job polling failed");
          toast({ variant: "error", title: "Generation failed" });
        }
      } finally {
        if (!cancelled) setIsPolling(false);
      }
    })();

    return () => { cancelled = true; };
  }, [genPhase, genJobId, toast]);

  useEffect(() => {
    if (refetchedWebsite) {
      setWebsiteData(refetchedWebsite);
    }
  }, [refetchedWebsite]);

  if (!blueprint) {
    return (
      <EmptyState icon={Globe} title="No website yet" description="Complete the founder interview to generate your startup's website." actionLabel="Start Interview" actionHref="/interview" />
    );
  }

  const isLoading = genPhase === "queued" || genPhase === "generating" || isPolling;
  const website = websiteData;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Website</h1>
            <p className="text-sm text-muted-foreground">Generate and deploy your startup website</p>
          </div>
        </div>
      </motion.div>

      {genPhase === "idle" && !website && (
        <motion.div variants={itemVariants}>
          <Card className="text-center p-12">
            <CardContent>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-display font-bold mb-2">Generate Your Website</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                Create a professional website from your blueprint data. AI generates copy, layout, and design tailored to your startup.
              </p>
              <Button size="lg" className="glow-purple" onClick={handleGenerate} disabled={generateWebsiteMut.isPending}>
                <Sparkles className="h-4 w-4" />
                {generateWebsiteMut.isPending ? "Starting..." : "Generate Website"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isLoading && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 bg-primary/5 text-center p-12">
            <CardContent>
              <div className="relative mx-auto mb-6 h-16 w-16">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              </div>
              <h2 className="text-lg font-display font-bold mb-2">Generating Your Website</h2>
              <p className="text-sm text-muted-foreground">This usually takes 30-60 seconds...</p>
              {genJobId && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    <Clock className="h-3 w-3 mr-1" />
                    Job: {genJobId.slice(0, 8)}...
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    {genPhase === "queued" ? "Queued" : "Generating"}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {genPhase === "failed" && (
        <motion.div variants={itemVariants}>
          <Card className="border-red-500/20 bg-red-500/5 text-center p-8">
            <CardContent>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                <X className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold mb-1">Generation Failed</h2>
              <p className="text-sm text-muted-foreground mb-4">{genError || "An error occurred during generation."}</p>
              <Button variant="outline" onClick={() => { setGenPhase("idle"); setGenJobId(null); setGenError(null); }}>
                <RotateCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {genPhase === "completed" && website && (
        <WebsitePreview
          website={website}
          websiteId={websiteId}
          onDeploy={async () => {
            if (!websiteId) return;
            try {
              const result = await deployMut.mutateAsync({ websiteId });
              const url = result.url || result.deployment_url || result.vercelUrl;
              if (url) {
                toast({ variant: "success", title: "Deployed!", message: `Your site is live at ${url}` });
              } else if (result.status === "deployed" || result.success) {
                toast({ variant: "success", title: "Deployed!", message: "Your website has been deployed." });
              } else {
                toast({ variant: "error", title: "Deploy failed", message: result.error || "Unknown error" });
              }
            } catch {
              toast({ variant: "error", title: "Deploy failed" });
            }
          }}
          deploying={deployMut.isPending}
          deployedUrl={website.deployment_url || ""}
        />
      )}

      {genPhase === "completed" && !website && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 bg-primary/5 text-center p-8">
            <CardContent>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <h2 className="text-lg font-semibold mb-1">Loading Website</h2>
              <p className="text-sm text-muted-foreground">Fetching your generated website...</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

function WebsitePreview({
  website, websiteId, onDeploy, deploying, deployedUrl,
}: {
  website: Website;
  websiteId: string | null;
  onDeploy: () => Promise<void>;
  deploying: boolean;
  deployedUrl?: string;
}) {
  const raw = website as unknown as Record<string, unknown>;
  const spec = raw.website_spec || raw.spec || {};
  const sections = (spec as Record<string, unknown>)?.sections as Array<{ type: string; heading?: string; content: string }> | undefined;

  return (
    <>
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 mx-auto mb-2">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium">Generated</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 mx-auto mb-2">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-sm font-medium">{sections?.length || 0} Sections</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 mx-auto mb-2">
              <Search className="h-5 w-5 text-cyan-400" />
            </div>
            <p className="text-sm font-medium">{deployedUrl ? "Deployed" : "Ready to deploy"}</p>
          </CardContent>
        </Card>
      </motion.div>

      {sections && sections.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-lg font-semibold">Website Preview</h2>
          <div className="rounded-2xl border border-glass-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border-b border-glass-border">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono ml-2">preview</span>
            </div>
            <div className="divide-y divide-glass-border max-h-96 overflow-y-auto">
              {sections.map((section, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">{section.type}</Badge>
                  </div>
                  {section.heading && <h3 className="text-sm font-semibold mb-1">{section.heading}</h3>}
                  <p className="text-xs text-muted-foreground line-clamp-2">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex gap-3">
        <Button size="lg" className="glow-purple flex-1" onClick={onDeploy} disabled={deploying || !!deployedUrl}>
          {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          {deployedUrl ? "Deployed" : "Deploy to Vercel"}
        </Button>
        {deployedUrl && (
          <Button size="lg" variant="outline" asChild>
            <a href={deployedUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open Live Site
            </a>
          </Button>
        )}
      </motion.div>
    </>
  );
}
