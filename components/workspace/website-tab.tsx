"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { useToast } from "@/components/ui/toast";
import type { Deployment } from "@/lib/types";
import { Globe, ExternalLink, Check, X, ArrowRight, Sparkles, Loader2, Code, Eye, Rocket, RotateCw, Clock, Search, Palette, Shield } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type DeployPhase = "idle" | "deploying" | "polling" | "success" | "failed";

export function WebsiteTab() {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Design style selector
  const [designStyle, setDesignStyle] = useState<string>("auto");

  interface AnalysisCategory {
  score: number;
  summary?: string;
  recommendations?: string[];
}

interface WebsiteAnalysisResult {
  overall: { score: number; summary: string; recommendations: string[] };
  brand: AnalysisCategory;
  seo: AnalysisCategory;
  ux: AnalysisCategory;
  copywriting: AnalysisCategory;
  performance: AnalysisCategory;
  [key: string]: AnalysisCategory | { score: number; summary: string; recommendations: string[] };
}

// Website analysis state
  const [analysisUrl, setAnalysisUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WebsiteAnalysisResult | null>(null);

  // Custom domain state
  const [domainInput, setDomainInput] = useState("");
  const [connectingDomain, setConnectingDomain] = useState(false);
  const [customDomains, setCustomDomains] = useState<Array<{ id: string; domain: string; verification_status: string }>>([]);
  const [showDomainSetup, setShowDomainSetup] = useState(false);

  // Deployment state
  const [deployPhase, setDeployPhase] = useState<DeployPhase>("idle");
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);

  // Deployment history
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { blueprint, interviewData } = useBlueprint();
  const { toast } = useToast();

  const loadDeploymentHistory = async (wId: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/deployments?websiteId=${encodeURIComponent(wId)}`);
      if (res.ok) {
        const data = await res.json();
        setDeployments(data.deployments || []);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load deployment history when a websiteId is known
  useEffect(() => {
    if (!websiteId) return;
    loadDeploymentHistory(websiteId); // eslint-disable-line react-hooks/set-state-in-effect
  }, [websiteId, loadDeploymentHistory]);

  const generateWebsite = useCallback(async () => {
    if (!blueprint || !interviewData) return;

    setIsGenerating(true);
    setError(null);
    setDeployPhase("idle");
    setDeployUrl(null);
    setDeployError(null);

    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupName: blueprint.startupName,
          tagline: blueprint.tagline,
          problem: blueprint.problem,
          solution: blueprint.solution,
          brand: blueprint.brand,
          icp: blueprint.icp,
          industry: interviewData.industry || "saas",
          designStyle: designStyle !== "auto" ? designStyle : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const html = data.website?.content?.html;
        const id = data.website?.id;
        if (html) {
          setGeneratedHtml(html);
          if (id) setWebsiteId(id);
        } else {
          throw new Error("No HTML content returned");
        }
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Generation failed");
      }
    } catch (err) {
      // Fallback: generate locally
      try {
        const { generateLandingPage } = await import("@/lib/startup/website-generator");
        const html = generateLandingPage({
          startupName: blueprint.startupName,
          tagline: blueprint.tagline,
          problem: blueprint.problem,
          solution: blueprint.solution,
          brand: blueprint.brand,
          icp: {
            title: blueprint.icp.title,
            description: blueprint.icp.description,
            painPoints: blueprint.icp.painPoints,
          },
          industry: interviewData.industry || "saas",
        });
        setGeneratedHtml(html);
        // Without a website ID, deployment is unavailable
        setWebsiteId(null);
      } catch {
        setError(err instanceof Error ? err.message : "Failed to generate website");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [blueprint, interviewData]);

  const deployWebsite = useCallback(async () => {
    if (!websiteId) {
      setDeployError("Regenerate the website via the API to enable deployment.");
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
        body: JSON.stringify({ websiteId }),
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
        setDeployError(data.logs?.[data.logs.length - 1] || "Deployment failed — check VERCEL_TOKEN configuration.");
        setDeployPhase("failed");

        toast({
          title: "Deployment failed",
          message: "Check the deployment logs for details.",
          variant: "error",
        });
      }

      // Refresh deployment history
      loadDeploymentHistory(websiteId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Deployment failed";
      setDeployError(message);
      setDeployPhase("failed");

      toast({
        title: "Deployment failed",
        message,
        variant: "error",
      });
    }
  }, [websiteId, toast]);

  const handleRedeploy = async () => {
    // Redeploy using the same websiteId — creates a fresh Vercel deployment
    deployWebsite();
  };

  const analyzeWebsite = useCallback(async () => {
    if (!analysisUrl) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch("/api/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: analysisUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.analysis);
      }
    } catch {
      // Silently fail
    } finally {
      setAnalyzing(false);
    }
  }, [analysisUrl]);

  const loadCustomDomains = async (wId: string) => {
    try {
      const res = await fetch(`/api/domains?websiteId=${encodeURIComponent(wId)}`);
      if (res.ok) {
        const data = await res.json();
        setCustomDomains(data.domains || []);
      }
    } catch {
      // Silently fail
    }
  };

  const connectDomain = useCallback(async () => {
    if (!domainInput || !websiteId) return;
    setConnectingDomain(true);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainInput, websiteId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast({ title: "Domain added", message: `Add DNS records to verify ${domainInput}`, variant: "success" });
          setDomainInput("");
          loadCustomDomains(websiteId);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setConnectingDomain(false);
    }
  }, [domainInput, websiteId, toast, loadCustomDomains]);

  const downloadHtml = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${blueprint?.startupName.toLowerCase().replace(/\s+/g, "-") || "startup"}-landing-page.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!blueprint) {
    return (
      <EmptyState
        icon={Globe}
        title="No website analysis yet"
        description="Complete the founder interview to generate an AI-powered landing page tailored to your brand and market."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { url, summary, strengths, improvements, recommendations } = blueprint.website;
  const initial = blueprint.startupName.charAt(0).toUpperCase();
  const hasDeployableContent = Boolean(generatedHtml && websiteId);
  const latestDeployment = deployments[0];
  const isDeployed = deployPhase === "success" || latestDeployment?.deployment_status === "deployed";

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
              <p className="text-muted-foreground text-sm">AI-powered analysis and generation</p>
            </div>
          </div>
          {generatedHtml && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-3.5 w-3.5" />
                {showPreview ? "Code" : "Preview"}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs gap-1.5"
                onClick={downloadHtml}
              >
                <Code className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Generate Button */}
      {!generatedHtml && (
        <motion.div variants={itemVariants}>
          <Card className="p-8 text-center hover:border-primary/20 transition-all">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Generate Landing Page</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Create a production-ready, responsive landing page for {blueprint.startupName} with SEO, accessibility, and your brand identity built in.
            </p>

            {/* Design Style Selector */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5 justify-center">
                <Palette className="h-3.5 w-3.5" />
                Select design style (Auto uses industry-optimized defaults)
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { value: "auto", label: "Auto", desc: "Industry-optimized" },
                  { value: "minimal", label: "Minimal", desc: "Clean & elegant" },
                  { value: "bold", label: "Bold", desc: "High energy" },
                  { value: "professional", label: "Pro", desc: "Corporate trust" },
                  { value: "playful", label: "Playful", desc: "Creative vibe" },
                  { value: "tech", label: "Tech", desc: "Dev-friendly" },
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setDesignStyle(style.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      designStyle === style.value
                        ? "bg-primary/20 text-primary border border-primary/40 shadow-sm"
                        : "bg-white/5 text-muted-foreground border border-glass-border hover:bg-white/10 hover:text-foreground"
                    }`}
                    title={style.desc}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateWebsite}
              disabled={isGenerating}
              size="lg"
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? "Generating..." : "Generate Landing Page"}
            </Button>
            {error && (
              <p className="text-xs text-red-400 mt-3">{error}</p>
            )}
          </Card>
        </motion.div>
      )}

      {/* Generated Preview */}
      {generatedHtml && showPreview && (
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-glass-border">
              <span className="text-xs text-muted-foreground font-mono">Preview</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => setShowPreview(false)}
              >
                <Code className="h-3 w-3" />
                Show Code
              </Button>
            </div>
            <iframe
              srcDoc={generatedHtml}
              title={`${blueprint.startupName} landing page preview`}
              className="w-full h-[600px] bg-black"
              sandbox="allow-scripts"
            />
          </Card>
        </motion.div>
      )}

      {/* Deploy Section */}
      {generatedHtml && (
        <motion.div variants={itemVariants}>
          <Card className={`overflow-hidden transition-all duration-500 ${
            deployPhase === "success"
              ? "border-emerald-500/30 shadow-lg shadow-emerald-500/10"
              : deployPhase === "failed"
              ? "border-red-500/30 shadow-lg shadow-red-500/10"
              : "hover:border-primary/20"
          }`}>
            {/* Status bar */}
            <div className={`h-1 w-full transition-all duration-500 ${
              deployPhase === "deploying" || deployPhase === "polling"
                ? "bg-gradient-to-r from-primary to-secondary animate-gradient-shift"
                : deployPhase === "success"
                ? "bg-emerald-500"
                : deployPhase === "failed"
                ? "bg-red-500"
                : "bg-transparent"
            }`} />

            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 ${
                  deployPhase === "success"
                    ? "bg-emerald-500/20"
                    : deployPhase === "failed"
                    ? "bg-red-500/20"
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

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold">
                      {deployPhase === "idle" && "Deploy to Production"}
                      {deployPhase === "deploying" && "Creating deployment..."}
                      {deployPhase === "polling" && "Waiting for build..."}
                      {deployPhase === "success" && "Successfully Deployed!"}
                      {deployPhase === "failed" && "Deployment Failed"}
                    </h3>
                    {isDeployed && (
                      <Badge variant="success" className="text-[10px] px-1.5 py-0">
                        Live
                      </Badge>
                    )}
                  </div>

                  {deployPhase === "idle" && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Deploy your generated landing page to Vercel and get a live URL you can share.
                    </p>
                  )}

                  {deployPhase === "deploying" && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-muted-foreground">
                        Uploading your landing page to Vercel...
                      </p>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: "0%" }}
                          animate={{ width: "60%" }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {deployPhase === "polling" && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-muted-foreground">
                        Your site is building on Vercel&apos;s edge network...
                      </p>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: "60%" }}
                          animate={{ width: "90%" }}
                          transition={{ duration: 8, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {deployPhase === "success" && deployUrl && (
                    <div className="mb-4">
                      <a
                        href={deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                      >
                        {deployUrl}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your site is live and accessible to anyone with the URL.
                      </p>
                    </div>
                  )}

                  {deployPhase === "failed" && deployError && (
                    <div className="mb-4">
                      <p className="text-xs text-red-400/80 mb-2">{deployError}</p>
                      {deployLogs.length > 0 && (
                        <details className="text-xs">
                          <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                            View deployment logs
                          </summary>
                          <pre className="mt-2 p-2 rounded-lg bg-black/30 text-[10px] text-muted-foreground font-mono max-h-32 overflow-y-auto">
                            {deployLogs.join("\n")}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {deployPhase === "idle" && (
                      <Button
                        onClick={deployWebsite}
                        size="sm"
                        className="gap-1.5"
                        disabled={!hasDeployableContent}
                      >
                        <Rocket className="h-3.5 w-3.5" />
                        Deploy to Vercel
                      </Button>
                    )}
                    {deployPhase === "failed" && (
                      <Button
                        onClick={deployWebsite}
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        Retry Deployment
                      </Button>
                    )}
                    {deployPhase === "success" && deployUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        asChild
                      >
                        <a href={deployUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Visit Live Site
                        </a>
                      </Button>
                    )}
                    {(deployPhase === "deploying" || deployPhase === "polling") && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        This usually takes 10-30 seconds...
                      </span>
                    )}
                    {!hasDeployableContent && deployPhase === "idle" && (
                      <p className="text-xs text-amber-400 flex items-center gap-1">
                        Regenerate via API to enable deployment
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Deployment History */}
      {deployments.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Deployment History
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">
                  {deployments.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {deployments.map((dep, i) => (
                <motion.div
                  key={dep.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-glass-border hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      dep.deployment_status === "deployed"
                        ? "bg-emerald-500/10"
                        : dep.deployment_status === "failed"
                        ? "bg-red-500/10"
                        : "bg-amber-500/10"
                    }`}>
                      {dep.deployment_status === "deployed" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : dep.deployment_status === "failed" ? (
                        <X className="h-3.5 w-3.5 text-red-400" />
                      ) : (
                        <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          dep.deployment_status === "deployed" ? "success" :
                          dep.deployment_status === "failed" ? "destructive" : "outline"
                        } className="text-[10px] px-1.5 py-0 uppercase">
                          {dep.deployment_status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(dep.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {dep.deployment_url && (
                        <a
                          href={dep.deployment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:text-primary/80 transition-colors truncate block max-w-[250px]"
                        >
                          {dep.deployment_url}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {dep.deployment_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        asChild
                      >
                        <a href={dep.deployment_url} target="_blank" rel="noopener noreferrer" aria-label="Open deployed site">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 px-2"
                      onClick={() => handleRedeploy()}
                      disabled={deployPhase === "deploying" || deployPhase === "polling"}
                    >
                      <RotateCw className="h-3 w-3" />
                      Redeploy
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading history */}
      {isLoadingHistory && websiteId && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
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
              <Button
                onClick={analyzeWebsite}
                disabled={analyzing || !analysisUrl}
                size="sm"
                className="gap-1.5 shrink-0"
              >
                {analyzing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                Analyze
              </Button>
            </div>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${
                    analysisResult.overall.score >= 70
                      ? "text-emerald-400"
                      : analysisResult.overall.score >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}>
                    {analysisResult.overall.score}/100
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          analysisResult.overall.score >= 70
                            ? "bg-emerald-500"
                            : analysisResult.overall.score >= 50
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${analysisResult.overall.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { key: "brand", label: "Brand", color: "bg-violet-500" },
                    { key: "seo", label: "SEO", color: "bg-blue-500" },
                    { key: "ux", label: "UX", color: "bg-cyan-500" },
                    { key: "copywriting", label: "Copy", color: "bg-amber-500" },
                    { key: "performance", label: "Perf", color: "bg-emerald-500" },
                  ].map((cat) => (
                    <div key={cat.key} className="text-center">
                      <div className="text-xs font-semibold">{analysisResult[cat.key]?.score || 0}</div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden mt-0.5">
                        <div
                          className={`h-full rounded-full ${cat.color} opacity-60`}
                          style={{ width: `${analysisResult[cat.key]?.score || 0}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">{cat.label}</div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {analysisResult.overall.summary}
                </p>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-foreground">Top Recommendations:</p>
                  {analysisResult.overall.recommendations.slice(0, 3).map((rec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Custom Domain Section */}
      {websiteId && (
        <motion.div variants={itemVariants}>
          <Card className="hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Shield className="h-4 w-4 text-emerald-400" />
                </div>
                <CardTitle className="text-sm font-semibold">Custom Domain</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {showDomainSetup ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Connect a custom domain to your deployed website. You&apos;ll need to add DNS records to your domain provider.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="yourdomain.com"
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-glass-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    />
                    <Button
                      onClick={connectDomain}
                      disabled={connectingDomain || !domainInput}
                      size="sm"
                      className="gap-1.5 shrink-0"
                    >
                      {connectingDomain ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Connect
                    </Button>
                  </div>
                  {customDomains.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">Connected Domains</p>
                      {customDomains.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-glass-border">
                          <span className="text-xs font-mono">{d.domain}</span>
                          <Badge variant={d.verification_status === "verified" ? "success" : "outline"} className="text-[10px]">
                            {d.verification_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Connect your own domain to make your site available at your custom URL.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => setShowDomainSetup(true)}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Add Domain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* URL & Summary */}
      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                {initial}
              </div>
              <div>
                <p className="text-lg font-medium">{url}</p>
                {url && (
                  <a
                    href={`https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <Badge variant="secondary" className="ml-auto">Analysis Ready</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Strengths & Improvements */}
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
                {strengths.map((strength, i) => (
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
                {improvements.map((improvement, i) => (
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

      {/* AI Suggestions */}
      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-glass-border">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground">{rec}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
