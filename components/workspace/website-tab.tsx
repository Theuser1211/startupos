"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { useToast } from "@/components/ui/toast";
import { WebsiteRenderer } from "@/components/website/website-renderer";
import type { WebsiteGenerationJob } from "@/lib/types";
import type { WebsiteSpec } from "@/lib/startup/website-spec";
import {
  Globe, ExternalLink, Check, X, ArrowRight, Sparkles, Loader2,
  Code, Eye, Rocket, RotateCw, Clock, Search, Shield, Cpu, RefreshCw,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type DeployPhase = "idle" | "deploying" | "polling" | "success" | "failed";

type GenPhase = "idle" | "queued" | "generating" | "completed" | "failed";

export function WebsiteTab() {
  // Generation state
  const [genPhase, setGenPhase] = useState<GenPhase>("idle");
  const [genJobId, setGenJobId] = useState<string | null>(null);
  const [websiteSpec, setWebsiteSpec] = useState<WebsiteSpec | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [genMetadata, setGenMetadata] = useState<{ provider: string; model: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Polling ref
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Website analysis state
  const [analysisUrl, setAnalysisUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  // Deployment state
  const [deployPhase, setDeployPhase] = useState<DeployPhase>("idle");
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);

  const { blueprint, interviewData } = useBlueprint();
  const { toast } = useToast();

  /* ─── Poll job status ─── */

  const startPolling = useCallback((jobId: string) => {
    // Clear any existing poll
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/websites/spec/${jobId}`);
        if (!res.ok) {
          setGenPhase("failed");
          setGenError("Failed to fetch job status");
          if (pollRef.current) clearInterval(pollRef.current);
          return;
        }

        const data = await res.json();
        const job = data.job as WebsiteGenerationJob;

        if (job.status === "completed") {
          setGenPhase("completed");
          setWebsiteSpec(job.website_spec as WebsiteSpec);
          setGenMetadata({
            provider: job.provider || "unknown",
            model: job.model || "unknown",
          });
          if (pollRef.current) clearInterval(pollRef.current);
          toast({
            title: "Website generated!",
            message: "Your AI website specification is ready.",
            variant: "success",
          });
        } else if (job.status === "failed") {
          setGenPhase("failed");
          setGenError(job.error_message || "AI generation failed. Please try again.");
          if (pollRef.current) clearInterval(pollRef.current);
        }
        // If still queued/generating, keep polling
      } catch {
        // Silently retry on network errors
      }
    }, 2000);
  }, [toast]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  /* ─── Generate Website Spec via AI ─── */

  const generateWebsite = useCallback(async () => {
    if (!blueprint || !interviewData) return;

    setGenPhase("queued");
    setGenError(null);
    setWebsiteSpec(null);
    setGenMetadata(null);
    setShowPreview(false);

    try {
      const res = await fetch("/api/websites/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprint,
          blueprintId: null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(errData.error || "Failed to start generation");
      }

      const data = await res.json();
      const job = data.job as WebsiteGenerationJob;

      if (job.status === "completed") {
        // AI finished synchronously (fast path)
        setGenPhase("completed");
        setWebsiteSpec(job.website_spec as WebsiteSpec);
        setGenMetadata({
          provider: job.provider || "unknown",
          model: job.model || "unknown",
        });
        toast({
          title: "Website generated!",
          message: "Your AI website specification is ready.",
          variant: "success",
        });
      } else if (job.status === "failed") {
        setGenPhase("failed");
        setGenError(job.error_message || "Generation failed");
      } else {
        // Job is queued/generating — start polling
        setGenJobId(job.id);
        setGenPhase("generating");
        startPolling(job.id);
      }
    } catch (err) {
      setGenPhase("failed");
      setGenError(err instanceof Error ? err.message : "Failed to generate website");
    }
  }, [blueprint, interviewData, startPolling, toast]);

  /* ─── Deploy ─── */

  const deployWebsite = useCallback(async () => {
    if (!websiteSpec) {
      setDeployError("Generate a website specification first.");
      setDeployPhase("failed");
      return;
    }

    setDeployPhase("deploying");
    setDeployError(null);
    setDeployLogs([]);

    try {
      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteSpec }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Deployment request failed");
      }

      const data = await res.json();

      if (data.success && data.url) {
        setDeployUrl(data.url);
        setDeployLogs(data.logs || []);
        setDeployPhase("success");
        toast({
          title: "Deployed successfully!",
          message: `Your site is live at ${data.url}`,
          variant: "success",
        });
      } else {
        setDeployLogs(data.logs || []);
        setDeployError(data.logs?.[data.logs.length - 1] || "Deployment failed");
        setDeployPhase("failed");
        toast({
          title: "Deployment failed",
          message: "Check the deployment logs for details.",
          variant: "error",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Deployment failed";
      setDeployError(message);
      setDeployPhase("failed");
      toast({ title: "Deployment failed", message, variant: "error" });
    }
  }, [websiteSpec, toast]);

  /* ─── Legacy helpers (analysis, domains, etc.) ─── */

  const analyzeWebsite = useCallback(async () => {
    if (!analysisUrl) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: analysisUrl }),
      });
      if (res.ok) {
        const _data = await res.json();
      }
    } catch {
      // Silently fail
    } finally {
      setAnalyzing(false);
    }
  }, [analysisUrl]);

  const downloadSpec = () => {
    if (!websiteSpec) return;
    const blob = new Blob([JSON.stringify(websiteSpec, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${blueprint?.startupName.toLowerCase().replace(/\s+/g, "-") || "startup"}-website-spec.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!blueprint) {
    return (
      <EmptyState
        icon={Globe}
        title="No website yet"
        description="Complete the founder interview to generate an AI-powered website specification tailored to your brand and market."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const hasDeployableContent = Boolean(websiteSpec && genPhase === "completed");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Website & Landing Page</h1>
              <p className="text-muted-foreground text-sm">AI-powered specification and rendering</p>
            </div>
          </div>
          {websiteSpec && genPhase === "completed" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <Code className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPreview ? "Spec" : "Preview"}
              </Button>
              <Button variant="default" size="sm" className="text-xs gap-1.5" onClick={downloadSpec}>
                <Code className="h-3.5 w-3.5" />
                Download Spec
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Generation Metadata (pre-generation) */}
      {blueprint.generationMetadata && genPhase === "idle" && (
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3">
          <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary border border-primary/30 gap-1">
            <Cpu className="h-3 w-3" />
            {blueprint.generationMetadata.provider === "groq" ? "Groq" : "DeepSeek"}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">{blueprint.generationMetadata.model}</span>
          {blueprint.generationMetadata.generationTime && (
            <span className="text-[10px] text-muted-foreground">
              {(blueprint.generationMetadata.generationTime / 1000).toFixed(1)}s
            </span>
          )}
        </motion.div>
      )}

      {/* Generate Button / Status */}
      {!websiteSpec && genPhase !== "completed" && (
        <motion.div variants={itemVariants}>
          <Card className="p-8 text-center hover:border-primary/20 transition-all">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {genPhase === "idle" && "Generate Website"}
              {genPhase === "queued" && "Queued..."}
              {genPhase === "generating" && "Generating with AI..."}
              {genPhase === "failed" && "Generation Failed"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              {genPhase === "idle" && `Generate a unique AI website specification for ${blueprint.startupName}, then render it as a live landing page.`}
              {genPhase === "queued" && "Your request has been queued. AI is preparing your website specification..."}
              {genPhase === "generating" && "The AI is analyzing your blueprint and generating a custom website specification. This usually takes 10-30 seconds..."}
              {genPhase === "failed" && genError}
            </p>

            {/* Progress indicators */}
            {(genPhase === "queued" || genPhase === "generating") && (
              <div className="mb-6 space-y-3">
                <div className="flex justify-center gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 w-6 rounded-full bg-primary/40"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {genPhase === "queued" ? "Waiting in queue..." : "Generating website specification..."}
                </p>
                {genJobId && (
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Job ID: {genJobId.substring(0, 8)}...
                  </p>
                )}
              </div>
            )}

            {/* Error with retry */}
            {genPhase === "failed" && (
              <p className="text-xs text-red-400 mb-4">{genError}</p>
            )}

            {/* Action buttons */}
            {genPhase === "idle" && (
              <Button onClick={generateWebsite} size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Website Spec
              </Button>
            )}
            {genPhase === "failed" && (
              <Button onClick={generateWebsite} variant="outline" size="lg" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Generation
              </Button>
            )}

            {/* Cancel hint */}
            {genPhase === "generating" && (
              <p className="text-xs text-muted-foreground mt-4">
                This page will update automatically when ready.
              </p>
            )}
          </Card>
        </motion.div>
      )}

      {/* Generated Spec Metadata */}
      {websiteSpec && genPhase === "completed" && genMetadata && (
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3">
          <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary border border-primary/30 gap-1">
            <Cpu className="h-3 w-3" />
            {genMetadata.provider === "groq" ? "Groq" : genMetadata.provider === "deepseek" ? "DeepSeek" : genMetadata.provider}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">{genMetadata.model}</span>
          {websiteSpec.metadata?.durationMs && (
            <span className="text-[10px] text-muted-foreground">
              {(websiteSpec.metadata.durationMs / 1000).toFixed(1)}s
            </span>
          )}
          {websiteSpec.sections.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {websiteSpec.sections.length} sections
            </span>
          )}
        </motion.div>
      )}

      {/* Preview */}
      {websiteSpec && showPreview && genPhase === "completed" && (
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-glass-border">
              <span className="text-xs text-muted-foreground font-mono">Live Preview</span>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setShowPreview(false)}>
                <Code className="h-3 w-3" />
                Show Spec
              </Button>
            </div>
            <div className="w-full max-h-[80vh] overflow-y-auto">
              <ErrorBoundary>
                <WebsiteRenderer spec={websiteSpec} />
              </ErrorBoundary>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Deploy Section */}
      {websiteSpec && genPhase === "completed" && (
        <motion.div variants={itemVariants}>
          <Card className={`overflow-hidden transition-all duration-500 ${
            deployPhase === "success"
              ? "border-emerald-500/30 shadow-lg shadow-emerald-500/10"
              : deployPhase === "failed"
              ? "border-red-500/30 shadow-lg shadow-red-500/10"
              : "hover:border-primary/20"
          }`}>
            <div className={`h-1 w-full transition-all duration-500 ${
              deployPhase === "deploying" || deployPhase === "polling"
                ? "bg-gradient-to-r from-primary to-secondary animate-gradient-shift"
                : deployPhase === "success" ? "bg-emerald-500"
                : deployPhase === "failed" ? "bg-red-500"
                : "bg-transparent"
            }`} />

            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all ${
                  deployPhase === "success" ? "bg-emerald-500/20"
                  : deployPhase === "failed" ? "bg-red-500/20"
                  : "bg-primary/10"
                }`}>
                  {deployPhase === "deploying" || deployPhase === "polling" ? (
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  ) : deployPhase === "success" ? (
                    <Rocket className="h-6 w-6 text-emerald-400" />
                  ) : deployPhase === "failed" ? (
                    <X className="h-6 w-6 text-red-400" />
                  ) : (
                    <Rocket className="h-6 w-6 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold">
                      {deployPhase === "idle" && "Deploy to Production"}
                      {deployPhase === "deploying" && "Creating deployment..."}
                      {deployPhase === "polling" && "Waiting for build..."}
                      {deployPhase === "success" && "Successfully Deployed!"}
                      {deployPhase === "failed" && "Deployment Failed"}
                    </h3>
                    {deployPhase === "success" && <Badge variant="success" className="text-[10px] px-1.5 py-0">Live</Badge>}
                  </div>

                  {deployPhase === "success" && deployUrl && (
                    <a href={deployUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                    >
                      {deployUrl} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <div className="flex gap-2 mt-4">
                    {deployPhase === "idle" && (
                      <Button onClick={deployWebsite} size="sm" className="gap-1.5" disabled={!hasDeployableContent}>
                        <Rocket className="h-3.5 w-3.5" />
                        Deploy to Vercel
                      </Button>
                    )}
                    {deployPhase === "failed" && (
                      <Button onClick={deployWebsite} size="sm" variant="outline" className="gap-1.5">
                        <RotateCw className="h-3.5 w-3.5" />
                        Retry Deployment
                      </Button>
                    )}
                    {deployPhase === "success" && deployUrl && (
                      <Button size="sm" variant="outline" className="gap-1.5" asChild>
                        <a href={deployUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Visit Live Site
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Website Analysis Section */}
      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                <Search className="h-4 w-4 text-violet-400" />
              </div>
              <CardTitle className="text-sm font-semibold">Analyze Existing Website</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Submit an existing website URL for AI-powered analysis of branding, SEO, UX, and performance.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={analysisUrl}
                onChange={(e) => setAnalysisUrl(e.target.value)}
                placeholder="example.com"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-glass-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && !analyzing && analysisUrl && analyzeWebsite()}
              />
              <Button onClick={analyzeWebsite} disabled={analyzing || !analysisUrl} size="sm" className="gap-1.5 shrink-0">
                {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Blueprint Website Info (read-only) */}
      {blueprint.website.url && !blueprint.website.url.includes("example.com") && (
        <motion.div variants={itemVariants}>
          <Card className="hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  {blueprint.startupName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-medium">{blueprint.website.url}</p>
                  <a href={`https://${blueprint.website.url}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{blueprint.website.summary}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Strengths & Improvements from blueprint */}
      <div className="grid gap-6 sm:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:border-emerald-500/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <CardTitle className="text-sm font-semibold">Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {blueprint.website.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full hover:border-amber-500/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <X className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <CardTitle className="text-sm font-semibold">Needs Improvement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {blueprint.website.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <ArrowRight className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
