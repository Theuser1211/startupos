"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, BookOpen, Mic, Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { StartupBlueprint } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function BrandTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  if (!blueprint) {
    return (
      <EmptyState
        icon={Palette}
        title="No brand guidelines yet"
        description="Complete the founder interview to see your AI-generated brand identity."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { mission, values, tone, colors, typography } = blueprint.brand;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Brand Identity</h1>
            <p className="text-sm text-muted-foreground">Your AI-crafted brand guidelines</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Mission & Values</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mission</p>
                <p className="text-sm leading-relaxed">{mission}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Core Values</p>
                <div className="flex flex-wrap gap-2">
                  {values.map((v) => (
                    <Badge key={v} variant="outline" className="text-xs border-primary/20 text-primary">{v}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Tone of Voice</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tone.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Color Palette</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {colors.map((color) => (
                <div key={color.name} className="space-y-2">
                  <div
                    className="h-20 rounded-xl border border-glass-border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="text-xs font-medium">{color.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Typography</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-glass-border p-4">
                <p className="text-xs text-muted-foreground">Heading Font</p>
                <p className="text-lg font-display font-bold">{typography.heading}</p>
              </div>
              <div className="space-y-2 rounded-xl border border-glass-border p-4">
                <p className="text-xs text-muted-foreground">Body Font</p>
                <p className="text-sm">{typography.body}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
