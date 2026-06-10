"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { analyzeBrand } from "@/lib/startup/logo-generator";
import {
  ImageIcon, Sparkles, Download, Heart, Check, Loader2,
  Palette, Eye, Lightbulb, Star,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface LogoDisplay {
  id: string;
  style: string;
  brandConcept: string;
  symbolReasoning: string;
  qualityScore: {
    overall: number;
    simplicity: number;
    memorability: number;
    faviconReadiness: number;
    scalability: number;
    uniqueness: number;
  };
  preview: string;
  fullPreview: string;
  monochromePreview: string;
  colors: string[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function QualityBadge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 90 ? "text-emerald-400" :
    score >= 75 ? "text-amber-400" :
    score >= 60 ? "text-orange-400" :
    "text-red-400";
  return (
    <div className={`flex items-center gap-1 text-[10px] ${color}`}>
      <Star className="h-2.5 w-2.5 fill-current" />
      <span className="font-medium">{label}: {score}</span>
    </div>
  );
}

export function LogoTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<"icon" | "full" | "mono">("icon");
  const [regenerating, setRegenerating] = useState(false);
  const [logos, setLogos] = useState<LogoDisplay[]>([]);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [brandAnalysis, setBrandAnalysis] = useState<{
    suggestedStyle: string;
    iconConcepts: string[];
    faviconStrategy: string;
    colorPsychology: string;
  } | null>(null);
  const { blueprint, interviewData } = useBlueprint();

  const generateLogos = useCallback(async () => {
    if (!blueprint) return;

    setRegenerating(true);
    setLogoError(null);
    try {
      const res = await fetch("/api/logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupName: blueprint.startupName,
          industry: interviewData?.industry || "saas",
          brandColors: blueprint.brand.colors,
          tone: blueprint.brand.tone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.logos) {
          setLogos(data.logos);
        } else {
          // API returned success but no logos — treat as failure
          setLogoError("No logos were generated. Please try again.");
        }
      } else {
        const errData = await res.json().catch(() => ({ error: "Logo generation failed" }));
        setLogoError(errData.error || "Logo generation failed. Please try again.");
      }
    } catch (err) {
      // No fallback — failure is better than fake logos
      console.error("[LogoTab] Logo generation failed:", err);
      setLogoError(err instanceof Error ? err.message : "Logo generation failed. Please try again.");
    } finally {
      setRegenerating(false);
    }

    const analysis = analyzeBrand(
      blueprint.startupName,
      interviewData?.industry || "saas",
      blueprint.brand.tone,
    );
    setBrandAnalysis(analysis);
  }, [blueprint, interviewData]);

  useEffect(() => {
    if (blueprint && logos.length === 0) {
      generateLogos(); // eslint-disable-line react-hooks/set-state-in-effect
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprint]);

  if (!blueprint) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No logo concepts yet"
        description="Complete the founder interview to see AI-generated SVG logo ideas tailored to your brand."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const downloadSvg = (logo: LogoDisplay, variant: "icon" | "full" | "mono") => {
    const link = document.createElement("a");
    const suffix = variant === "icon" ? "" : `-${variant}`;
    const href = variant === "icon" ? logo.preview : variant === "full" ? logo.fullPreview : logo.monochromePreview;
    link.download = `${blueprint.startupName.toLowerCase().replace(/\s+/g, "-")}-${logo.style.toLowerCase().replace(/\s+/g, "-")}${suffix}.svg`;
    link.href = href;
    link.click();
  };

  const handleSelect = (id: string) => {
    setSelected(selected === id ? null : id);
  };

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Logo Concepts</h1>
              <p className="text-muted-foreground text-sm">SVG logos for {blueprint.startupName}</p>
            </div>
          </div>
          {logos.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={generateLogos}
              disabled={regenerating}
              className="text-xs gap-1.5"
            >
              {regenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Regenerate
            </Button>
          )}
        </div>

        {/* Brand Analysis */}
        {brandAnalysis && (
          <Card className="mt-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                </div>
                <div className="space-y-2 min-w-0">
                  <p className="text-sm font-medium">Brand Analysis</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      <Eye className="h-3 w-3 mr-1" />
                      Style: {brandAnalysis.suggestedStyle}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      <Palette className="h-3 w-3 mr-1" />
                      {brandAnalysis.faviconStrategy}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {brandAnalysis.colorPsychology}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {brandAnalysis.iconConcepts.map((concept, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-glass-border"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Logo Grid */}
      {logos.length > 0 ? (
        <motion.div
          variants={itemVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {logos.map((logo) => {
            const isSelected = selected === logo.id;
            const score = logo.qualityScore;
            return (
              <Card
                key={logo.id}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected
                    ? "border-primary/50 ring-1 ring-primary/30 shadow-lg shadow-primary/10"
                    : "hover:border-primary/20"
                }`}
                onClick={() => handleSelect(logo.id)}
              >
                <CardContent className="p-5">
                  {/* Preview area — show icon by default, tabs if selected */}
                  <div className="mb-3 flex items-center justify-center h-36 rounded-xl bg-white/[0.02] border border-glass-border overflow-hidden">
                    {isSelected ? (
                      <Tabs
                        value={selectedView}
                        onValueChange={(v) => setSelectedView(v as "icon" | "full" | "mono")}
                        className="w-full"
                      >
                        <TabsList className="mx-auto mb-2 w-auto">
                          <TabsTrigger value="icon" className="text-[10px] px-2 py-0.5 h-6">Icon</TabsTrigger>
                          <TabsTrigger value="full" className="text-[10px] px-2 py-0.5 h-6">Full</TabsTrigger>
                          <TabsTrigger value="mono" className="text-[10px] px-2 py-0.5 h-6">Mono</TabsTrigger>
                        </TabsList>
                        <TabsContent value="icon" className="mt-0">
                          <img src={logo.preview} alt="" className="w-28 h-28 object-contain mx-auto" loading="lazy" />
                        </TabsContent>
                        <TabsContent value="full" className="mt-0">
                          <img src={logo.fullPreview} alt="" className="w-full h-28 object-contain mx-auto" loading="lazy" />
                        </TabsContent>
                        <TabsContent value="mono" className="mt-0">
                          <img src={logo.monochromePreview} alt="" className="w-28 h-28 object-contain mx-auto" loading="lazy" />
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <img
                        src={logo.preview}
                        alt={`${blueprint.startupName} ${logo.style} logo`}
                        className="w-28 h-28 object-contain"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {/* Style & Brand Concept */}
                  <Badge variant="outline" className="mb-1.5 text-[10px]">{logo.style}</Badge>
                  <p className="text-[11px] font-medium text-foreground leading-snug mb-1">
                    {logo.brandConcept}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
                    {logo.symbolReasoning}
                  </p>

                  {/* Quality Scores */}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-2">
                    <QualityBadge score={score.overall} label="Score" />
                    <QualityBadge score={score.faviconReadiness} label="Favicon" />
                    <QualityBadge score={score.simplicity} label="Simple" />
                  </div>

                  {/* Colors */}
                  <div className="flex gap-1.5 mb-3">
                    {logo.colors.map((color, i) => (
                      <div
                        key={i}
                        className="h-3.5 w-3.5 rounded-full border border-white/10"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-[10px] h-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(logo.id);
                      }}
                    >
                      <Heart className={`h-3 w-3 ${isSelected ? "fill-current" : ""}`} />
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] gap-1 h-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSvg(logo, "icon");
                      }}
                    >
                      <Download className="h-3 w-3" />
                      SVG
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <ImageIcon className="h-8 w-8 text-white" />
            </div>
            {logoError ? (
              <>
                <h3 className="text-lg font-semibold mb-2 text-red-400">Generation Failed</h3>
                <p className="text-sm text-red-400/80 max-w-md mx-auto mb-6">
                  {logoError}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Generate Logo Concepts</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Create SVG logos tailored to {blueprint.startupName}&apos;s brand identity.
                </p>
              </>
            )}
            <Button
              onClick={generateLogos}
              disabled={regenerating}
              className="gap-2"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {regenerating ? "Generating..." : "Generate Logos"}
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Selected Logo Detail */}
      {selected && (() => {
        const selectedLogo = logos.find((l) => l.id === selected);
        if (!selectedLogo) return null;
        const score = selectedLogo.qualityScore;
        return (
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-6"
          >
            <div className="flex items-center gap-2 justify-center mb-4">
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium">Selected Logo</span>
            </div>

            {/* Preview variants */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Icon</p>
                <img
                  src={selectedLogo.preview}
                  alt=""
                  className="w-16 h-16 object-contain mx-auto"
                />
              </div>
              <div className="text-center flex-1 max-w-[200px]">
                <p className="text-[10px] text-muted-foreground mb-1">Full Logo</p>
                <img
                  src={selectedLogo.fullPreview}
                  alt=""
                  className="w-full h-10 object-contain mx-auto"
                />
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Monochrome</p>
                <img
                  src={selectedLogo.monochromePreview}
                  alt=""
                  className="w-16 h-16 object-contain mx-auto"
                />
              </div>
            </div>

            <p className="text-sm font-semibold text-center">{selectedLogo.style}</p>
            <p className="text-xs text-muted-foreground text-center mb-2">{selectedLogo.brandConcept}</p>
            <p className="text-[11px] text-muted-foreground text-center max-w-md mx-auto mb-4 leading-relaxed">
              {selectedLogo.symbolReasoning}
            </p>

            {/* Quality scores */}
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-400">{score.overall}</div>
                <div className="text-[9px] text-muted-foreground">Overall</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{score.faviconReadiness}</div>
                <div className="text-[9px] text-muted-foreground">Favicon</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-400">{score.simplicity}</div>
                <div className="text-[9px] text-muted-foreground">Simplicity</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{score.memorability}</div>
                <div className="text-[9px] text-muted-foreground">Memorability</div>
              </div>
            </div>

            {/* Download buttons */}
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => downloadSvg(selectedLogo, "icon")}>
                <Download className="h-3.5 w-3.5" />
                Icon SVG
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => downloadSvg(selectedLogo, "full")}>
                <Download className="h-3.5 w-3.5" />
                Full SVG
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => downloadSvg(selectedLogo, "mono")}>
                <Download className="h-3.5 w-3.5" />
                Mono SVG
              </Button>
            </div>
          </motion.div>
        );
      })()}
    </motion.div>
  );
}
