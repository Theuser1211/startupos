"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StagedProgress } from "@/components/ui/staged-progress";
import { useToast } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { EmptyState } from "@/components/ui/empty-state";
import { useGenerateWebsite, useDeploy, useWebsite } from "@/lib/hooks/use-startup";
import { getWebsiteByStartup } from "@/lib/api/websites";
import { fireCelebration } from "@/lib/confetti";
import {
  Globe, ExternalLink, Check, X, Sparkles, Loader2,
  Rocket, RotateCw, Search, Shield,
} from "lucide-react";
import type { StartupBlueprint } from "@/lib/types";

const websiteStages = [
  { label: "Creating structure", description: "Designing your site architecture" },
  { label: "Designing branding", description: "Applying your brand identity" },
  { label: "Generating content", description: "Writing copy for each section" },
  { label: "Building sections", description: "Assembling page components" },
  { label: "Finalizing", description: "Polishing and optimizing your site" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type GenPhase = "idle" | "generating" | "completed" | "failed";

export function WebsiteTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  const [genPhase, setGenPhase] = useState<GenPhase>("idle");
  const [websiteData, setWebsiteData] = useState<Record<string, unknown> | null>(null);
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [genStage, setGenStage] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const genTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const celebrationFiredRef = useRef(false);

  const { toast } = useToast();
  const generateWebsiteMut = useGenerateWebsite();
  const deployMut = useDeploy();

  useEffect(() => {
    const startupId = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("id")
      : null;
    if (startupId) {
      getWebsiteByStartup(startupId).then((existing) => {
        if (existing) {
          setWebsiteId(existing.id);
          setWebsiteData(existing as unknown as Record<string, unknown>);
          setGenPhase("completed");
          setGenStage(websiteStages.length - 1);
          setGenProgress(100);
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (genPhase === "generating") {
      const totalDuration = 30000;
      const interval = 250;
      const stepDuration = totalDuration / websiteStages.length;
      let elapsed = 0;

      genTimerRef.current = setInterval(() => {
        elapsed += interval;
        const rawProgress = (elapsed / totalDuration) * 100;
        const stageIndex = Math.min(Math.floor(elapsed / stepDuration), websiteStages.length - 1);
        setGenStage(stageIndex);
        setGenProgress(Math.min(rawProgress, 95));
      }, interval);

      return () => {
        if (genTimerRef.current) clearInterval(genTimerRef.current);
      };
    }
  }, [genPhase]);

  const handleGenerate = useCallback(async () => {
    if (!blueprint?.startupName) {
      toast({ variant: "error", title: "No blueprint data", message: "Complete the interview first." });
      return;
    }
    setGenPhase("generating");
    setGenError(null);
    try {
      const startupId = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("id")
        : null;
      if (!startupId) {
        throw new Error("No startup ID found");
      }
      const res = await generateWebsiteMut.mutateAsync({ startupId });
      if (res.website) {
        setWebsiteId(res.website.id);
        setWebsiteData(res.website as unknown as Record<string, unknown>);
      }
      setGenStage(websiteStages.length - 1);
      setGenProgress(100);
      if (genTimerRef.current) clearInterval(genTimerRef.current);
      if (!celebrationFiredRef.current) {
        celebrationFiredRef.current = true;
        fireCelebration();
        toast({ variant: "success", title: "Website ready!", message: "Your website has been generated successfully." });
      }
      setGenPhase("completed");
    } catch (err) {
      setGenPhase("failed");
      setGenError(err instanceof Error ? err.message : "Failed to generate website.");
      toast({ variant: "error", title: "Generation failed" });
    }
  }, [blueprint, generateWebsiteMut, toast]);

  if (!blueprint) {
    return (
      <EmptyState icon={Globe} title="No website yet" description="Complete the founder interview to generate your startup's website." actionLabel="Start Interview" actionHref="/interview" />
    );
  }

  const website = websiteData;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 border border-primary/20">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold"><span className="text-primary font-mono text-xl">$</span> Website</h1>
            <p className="text-sm text-muted-foreground font-mono text-xs">$ generate --deploy startup_website</p>
          </div>
        </div>
      </motion.div>

      {genPhase === "idle" && !website && (
        <motion.div variants={itemVariants}>
          <Card className=" text-center p-8">
            <CardContent>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded bg-primary/10 border border-primary/20">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-mono text-primary">$ generate</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Generate Your Website</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8 font-mono text-xs">
                Create a professional website from your blueprint data. AI generates copy, layout, and design tailored to your startup.
              </p>
              <Button size="lg" className="font-mono" onClick={handleGenerate} disabled={generateWebsiteMut.isPending}>
                <Sparkles className="h-4 w-4" />
                {generateWebsiteMut.isPending ? "$ generating..." : "$ generate website"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {genPhase === "generating" && (
        <motion.div variants={itemVariants}>
          <Card className=" border-primary/20 bg-[#0d0d10] text-center p-8">
            <CardContent>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-mono text-emerald-400">$ generating...</span>
              </div>
              <h2 className="text-lg font-bold mb-2">Generating Your Website</h2>
              <p className="text-sm text-muted-foreground mb-8 font-mono text-xs">Building your site from your blueprint...</p>
              <StagedProgress stages={websiteStages} currentStage={genStage} progress={genProgress} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {genPhase === "failed" && (
        <motion.div variants={itemVariants}>
          <Card className=" border-red-500/20 bg-[#0d0d10] text-center p-8">
            <CardContent>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded bg-red-500/10 border border-red-500/20">
                <X className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-mono text-red-400">! error</span>
              </div>
              <h2 className="text-lg font-mono font-semibold mb-1">Generation Failed</h2>
              <p className="text-sm text-muted-foreground mb-4 font-mono text-xs">{genError || "An error occurred during generation."}</p>
              <Button variant="outline" className="font-mono" onClick={() => { setGenPhase("idle"); setWebsiteData(null); setWebsiteId(null); setGenError(null); }}>
                <RotateCw className="h-4 w-4" />
                $ retry
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
              if (result.success && result.url) {
                toast({ variant: "success", title: "Deployed!", message: `Your site is live at ${result.url}` });
              } else {
                toast({ variant: "error", title: "Deploy failed", message: result.error || "Unknown error" });
              }
            } catch {
              toast({ variant: "error", title: "Deploy failed" });
            }
          }}
          deploying={deployMut.isPending}
          deployedUrl={(website as Record<string, string>)?.url}
        />
      )}
    </motion.div>
  );
}

function WebsitePreview({
  website, websiteId, onDeploy, deploying, deployedUrl,
}: {
  website: Record<string, unknown>;
  websiteId: string | null;
  onDeploy: () => Promise<void>;
  deploying: boolean;
  deployedUrl?: string;
}) {
  const spec = website.website_spec || website.spec || website;
  const sections = (spec as Record<string, unknown>)?.sections as Array<{ type: string; heading?: string; content: string }> | undefined;

  return (
    <>
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
        <Card className=" hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-2">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm font-mono font-medium text-emerald-400">{">"} Generated</p>
          </CardContent>
        </Card>
        <Card className=" hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 border border-primary/20 mx-auto mb-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-mono font-medium">{sections?.length || 0} sections</p>
          </CardContent>
        </Card>
        <Card className=" hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-cyan-500/10 border border-cyan-500/20 mx-auto mb-2">
              <Search className="h-5 w-5 text-cyan-400" />
            </div>
            <p className="text-sm font-mono font-medium">{deployedUrl ? "Deployed" : "Ready to deploy"}</p>
          </CardContent>
        </Card>
      </motion.div>

      {sections && sections.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-lg font-bold mono-label"><span className="text-primary mr-2">$</span> Website Preview</h2>
          <div className="terminal-window border border-primary/20 overflow-hidden">
            <div className="terminal-panel-header flex items-center gap-2 px-4 py-2 border-b border-primary/10 bg-[#0d0d10]">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono ml-2">$ preview --site</span>
            </div>
            <div className="divide-y divide-primary/10 max-h-96 overflow-y-auto">
              {sections.map((section, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase font-mono">{section.type}</Badge>
                  </div>
                  {section.heading && <h3 className="text-sm font-mono font-semibold mb-1">{section.heading}</h3>}
                  <p className="text-xs text-muted-foreground font-mono line-clamp-2">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex gap-3">
        <Button size="lg" className="font-mono flex-1" onClick={onDeploy} disabled={deploying || !!deployedUrl}>
          {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          {deployedUrl ? "$ deployed" : "$ deploy --vercel"}
        </Button>
        {deployedUrl && (
          <Button size="lg" variant="outline" className="font-mono" asChild>
            <a href={deployedUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {">"} Open Live Site
            </a>
          </Button>
        )}
      </motion.div>
    </>
  );
}
