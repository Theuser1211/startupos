"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { ImageIcon, Sparkles, Download, Heart, Check, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function LogoTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [logos, setLogos] = useState<{
    id: string;
    description: string;
    style: string;
    preview: string;
    colors: string[];
  }[]>([]);
  const { blueprint, interviewData } = useBlueprint();

  // Generate logos from blueprint data
  const generateLogos = useCallback(async () => {
    if (!blueprint) return;

    setRegenerating(true);
    try {
      const res = await fetch("/api/logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupName: blueprint.startupName,
          industry: interviewData?.industry || "saas",
          brandColors: blueprint.brand.colors,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLogos(data.logos || []);
      }
    } catch {
      // Fallback to local generation
      const { serializeLogos } = await import("@/lib/startup/logo-generator");
      const localLogos = serializeLogos(
        blueprint.startupName,
        interviewData?.industry || "saas",
        blueprint.brand.colors,
      );
      setLogos(localLogos);
    } finally {
      setRegenerating(false);
    }
  }, [blueprint, interviewData]);

  // Generate logos on mount
  useEffect(() => {
    if (blueprint && logos.length === 0) {
      generateLogos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprint]);

  if (!blueprint) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No logo concepts yet"
        description="Complete the founder interview to see AI-generated SVG logo ideas tailored to your brand, with multiple styles and color palettes."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const initial = blueprint.startupName.charAt(0).toUpperCase();

  const downloadSvg = (logo: typeof logos[0]) => {
    const link = document.createElement("a");
    link.download = `${blueprint.startupName.toLowerCase().replace(/\s+/g, "-")}-${logo.style.toLowerCase().replace(/\s+\/\/\s+/, "-")}.svg`;
    link.href = logo.preview;
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
              <p className="text-muted-foreground text-sm">AI-generated SVG logos for {blueprint.startupName}</p>
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
      </motion.div>

      {/* Logo Grid */}
      {logos.length > 0 ? (
        <motion.div
          variants={itemVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {logos.map((logo) => {
            const isSelected = selected === logo.id;
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
                  {/* SVG Preview */}
                  <div className="mb-4 flex items-center justify-center h-36 rounded-xl bg-white/[0.02] border border-glass-border overflow-hidden">
                    <img
                      src={logo.preview}
                      alt={`${blueprint.startupName} ${logo.style} logo`}
                      className="w-32 h-32 object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <Badge variant="outline" className="mb-2 text-xs">{logo.style}</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {logo.description}
                  </p>

                  {/* Colors */}
                  <div className="flex gap-1.5">
                    {logo.colors.map((color, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded-full border border-white/10"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs"
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
                      className="text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSvg(logo);
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
            <h3 className="text-lg font-semibold mb-2">Generating Logo Concepts</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Creating SVG logos tailored to {blueprint.startupName}&apos;s brand identity...
            </p>
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

      {/* Selected Logo Display */}
      {selected && (() => {
        const selectedLogo = logos.find((l) => l.id === selected);
        if (!selectedLogo) return null;
        return (
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center"
          >
            <div className="flex items-center gap-2 justify-center mb-3">
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium">Selected Logo</span>
            </div>
            <img
              src={selectedLogo.preview}
              alt={`Selected ${selectedLogo.style} logo`}
              className="w-24 h-24 object-contain mx-auto mb-3"
            />
            <p className="text-sm font-semibold">{selectedLogo.style}</p>
            <p className="text-xs text-muted-foreground mb-3">{selectedLogo.description}</p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => downloadSvg(selectedLogo)}
            >
              <Download className="h-3.5 w-3.5" />
              Download SVG
            </Button>
          </motion.div>
        );
      })()}
    </motion.div>
  );
}
