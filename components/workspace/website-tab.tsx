"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { Globe, ExternalLink, Check, X, ArrowRight, Sparkles, Loader2, Code, Eye } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function WebsiteTab() {
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { blueprint, interviewData } = useBlueprint();

  const generateWebsite = useCallback(async () => {
    if (!blueprint || !interviewData) return;

    setIsGenerating(true);
    setError(null);

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
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const html = data.website?.content?.html;
        if (html) {
          setGeneratedHtml(html);
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
      } catch (fallbackErr) {
        setError(err instanceof Error ? err.message : "Failed to generate website");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [blueprint, interviewData]);

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
