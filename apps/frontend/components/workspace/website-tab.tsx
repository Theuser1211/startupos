"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { useGenerateWebsite, useDeploy } from "@/lib/hooks/use-startup";
import { getWebsiteByStartup } from "@/lib/api/websites";
import {
  Globe, ExternalLink, X, Loader2,
  Rocket, RotateCw,
} from "lucide-react";
import type { StartupBlueprint } from "@/lib/types";

type GenPhase = "idle" | "generating" | "completed" | "failed";

const STORAGE_KEY_PREFIX = "startupos-gen-website-";

export function WebsiteTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  const [genPhase, setGenPhase] = useState<GenPhase>("idle");
  const [websiteData, setWebsiteData] = useState<Record<string, unknown> | null>(null);
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const { toast } = useToast();
  const generateWebsiteMut = useGenerateWebsite();
  const deployMut = useDeploy();

  const startupId = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("id")
    : null;

  const storageKey = startupId ? `${STORAGE_KEY_PREFIX}${startupId}` : null;

  const clearGenFlag = useCallback(() => {
    if (storageKey) sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (!startupId) return;

    getWebsiteByStartup(startupId).then((existing) => {
      if (existing) {
        setWebsiteId(existing.id);
        setWebsiteData(existing as unknown as Record<string, unknown>);
        setGenPhase("completed");
        clearGenFlag();
      } else if (storageKey && sessionStorage.getItem(storageKey) === "true") {
        handleGenerate();
      }
    }).catch(() => {});
  }, [startupId]);

  const handleGenerate = useCallback(async () => {
    if (!blueprint?.startupName) {
      toast({ variant: "error", title: "No blueprint data", message: "Complete the interview first." });
      return;
    }
    if (!startupId) {
      toast({ variant: "error", title: "No startup ID", message: "Cannot generate without a startup." });
      return;
    }
    setGenPhase("generating");
    setGenError(null);
    if (storageKey) sessionStorage.setItem(storageKey, "true");
    try {
      const res = await generateWebsiteMut.mutateAsync({ startupId });
      if (res.website) {
        setWebsiteId(res.website.id);
        setWebsiteData(res.website as unknown as Record<string, unknown>);
      } else {
        throw new Error("No website data returned from server");
      }
      toast({ variant: "success", title: "Website ready!", message: "Your website has been generated." });
      setGenPhase("completed");
      clearGenFlag();
    } catch (err) {
      setGenPhase("failed");
      setGenError(err instanceof Error ? err.message : "Failed to generate website.");
      toast({ variant: "error", title: "Generation failed" });
      clearGenFlag();
    }
  }, [blueprint, generateWebsiteMut, toast, startupId, storageKey, clearGenFlag]);

  const handleRegenerate = useCallback(() => {
    setWebsiteData(null);
    setWebsiteId(null);
    setGenPhase("idle");
    handleGenerate();
  }, [handleGenerate]);

  if (!blueprint) {
    return (
      <EmptyState icon={Globe} title="No website yet" description="Complete the founder interview to generate your startup's website." actionLabel="Start Interview" actionHref="/interview" />
    );
  }

  const website = websiteData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Website</h1>
      </div>

      {genPhase === "idle" && !website && (
        <div>
          <Card className="text-center p-8">
            <CardContent>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded bg-primary/10 border border-primary/20">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Generate Your Website</h2>
              <Button size="lg" onClick={handleGenerate} disabled={generateWebsiteMut.isPending}>
                {generateWebsiteMut.isPending ? "Generating..." : "Generate website"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {genPhase === "generating" && (
        <div>
          <Card className="border-primary/20 text-center p-8">
            <CardContent>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded bg-primary/10 border border-primary/20">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h2 className="text-lg font-bold mb-2">Generating Your Website</h2>
              <p className="text-sm text-muted-foreground">Building your site from your blueprint...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {genPhase === "failed" && (
        <div>
          <Card className="border-red-500/20 text-center p-8">
            <CardContent>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded bg-red-500/10 border border-red-500/20">
                <X className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold mb-1">Generation Failed</h2>
              <p className="text-sm text-muted-foreground mb-4">{genError || "An error occurred during generation."}</p>
              <Button variant="outline" onClick={() => { setGenPhase("idle"); setWebsiteData(null); setWebsiteId(null); setGenError(null); }}>
                <RotateCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {genPhase === "completed" && website && (
        <div className="space-y-6">
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
          <div className="text-center">
            <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={generateWebsiteMut.isPending}>
              <RotateCw className="h-4 w-4 mr-1" />
              Regenerate Website
            </Button>
          </div>
        </div>
      )}
    </div>
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
  const specObj = website?.spec as Record<string, unknown> | undefined;
  const specContent = specObj?.content as Record<string, unknown> | undefined;
  const pageList = specContent?.pages as Array<Record<string, unknown>> | undefined;
  const sections = pageList?.flatMap(p => (p.sections as Array<Record<string, unknown>>) || []).map(s => ({
    type: s.type as string,
    heading: ((s.content as Record<string, unknown>)?.heading as string) || undefined,
    content: ((s.content as Record<string, unknown>)?.content as string) || ((s.content as Record<string, unknown>)?.text as string) || "",
  })) as Array<{ type: string; heading?: string; content: string }> | undefined;

  return (
    <>
      {sections && sections.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Website Preview</h2>
          <div className="border overflow-hidden rounded">
            <div className="divide-y max-h-96 overflow-y-auto">
              {sections.map((section, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded uppercase">{section.type}</span>
                  </div>
                  {section.heading && <h3 className="text-sm font-semibold mb-1">{section.heading}</h3>}
                  <p className="text-xs text-muted-foreground line-clamp-2">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button size="lg" className="flex-1" onClick={onDeploy} disabled={deploying || !!deployedUrl}>
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
      </div>
    </>
  );
}
