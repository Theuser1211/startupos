"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { Palette, BookOpen, Mic, Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function BrandTab() {
  const { blueprint } = useBlueprint();
  if (!blueprint) {
    return (
      <EmptyState
        icon={Palette}
        title="No brand guidelines yet"
        description="Complete the founder interview to see your AI-generated brand identity with mission, values, tone of voice, colors, and typography."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { mission, values, tone, colors, typography } = blueprint.brand;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Brand Guidelines</h1>
            <p className="text-muted-foreground text-sm">Your brand identity and voice</p>
          </div>
        </div>
      </motion.div>

      {/* Mission & Values */}
      <div className="grid gap-6 sm:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                &ldquo;{mission}&rdquo;
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Core Values</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {values.map((value, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">{value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tone of Voice */}
      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Tone of Voice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tone.map((t, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1.5 text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Colors */}
      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Color Palette</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {colors.map((color) => (
                <div key={color.name} className="flex flex-col items-center gap-2">
                  <div
                    className="h-16 w-16 rounded-xl shadow-lg border border-white/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className="text-xs font-medium">{color.name}</p>
                  <p className="text-[10px] text-muted-foreground">{color.hex}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Typography */}
      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Typography</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Heading Font</p>
                <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {typography.heading}
                </p>
                <p className="text-sm text-muted-foreground">
                  Used for headlines, titles, and display text
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Body Font</p>
                <p className="text-xl font-medium">
                  {typography.body}
                </p>
                <p className="text-sm text-muted-foreground">
                  Used for paragraphs, buttons, and UI elements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
