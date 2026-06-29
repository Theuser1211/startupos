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
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 border border-primary/20">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold"><span className="text-primary font-mono text-xl">$</span> Brand Identity</h1>
            <p className="text-sm text-muted-foreground font-mono text-xs">$ cat ~/brand/guidelines</p>
            <p className="text-[9px] text-muted-foreground/20 font-mono italic mt-0.5">// your brand is what people say about you when you're not in the room</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className=" h-full hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> Mission & Values</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mono-label text-xs text-muted-foreground mb-1">Mission</p>
                <p className="text-sm font-mono leading-relaxed">{mission}</p>
              </div>
              <div>
                <p className="mono-label text-xs text-muted-foreground mb-2">Core Values</p>
                <div className="flex flex-wrap gap-2">
                  {values.map((v) => (
                    <Badge key={v} variant="outline" className="text-xs border-primary/20 text-primary font-mono">{v}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className=" h-full hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> Tone of Voice</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tone.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs font-mono">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className=" hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> Color Palette</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {colors.map((color) => (
                <div key={color.name} className="space-y-2">
                  <div
                    className="h-20 rounded-lg border border-primary/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="text-xs font-mono font-medium">{color.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className=" hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> Typography</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 rounded border border-primary/10 bg-[#0d0d10] p-4">
                <p className="mono-label text-xs text-muted-foreground">Heading Font</p>
                <p className="text-lg font-bold">{typography.heading}</p>
              </div>
              <div className="space-y-2 rounded border border-primary/10 bg-[#0d0d10] p-4">
                <p className="mono-label text-xs text-muted-foreground">Body Font</p>
                <p className="text-sm font-mono">{typography.body}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
