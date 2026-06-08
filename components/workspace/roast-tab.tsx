"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { Flame, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const severityConfig = {
  high: { color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/20", label: "Critical" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20", label: "Warning" },
  low: { color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20", label: "Suggestion" },
};

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

export function RoastTab() {
  const [expanded, setExpanded] = useState<string | null>("all");
  const [showAll, setShowAll] = useState(false);
  const { blueprint } = useBlueprint();
  if (!blueprint) {
    return (
      <EmptyState
        icon={Flame}
        title="No roast yet"
        description="Complete the founder interview to get brutally honest AI feedback on your startup — blind spots, risks, and growth opportunities."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { roast } = blueprint;
  const displayed = showAll ? roast.items : roast.items.filter((r) => r.severity === "high" || r.severity === "medium");

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Startup Roast 🔥</h1>
            <p className="text-muted-foreground text-sm">Brutally honest AI feedback. No sugar-coating.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
        <Card className="hover:border-red-500/20 transition-all duration-300">
          <CardContent className="p-5 text-center">
            <p className="text-2xl font-bold text-red-400">
              {roast.items.filter((r) => r.severity === "high").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Critical Issues</p>
          </CardContent>
        </Card>
        <Card className="hover:border-amber-500/20 transition-all duration-300">
          <CardContent className="p-5 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {roast.items.filter((r) => r.severity === "medium").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Warnings</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-5 text-center">
            <p className="text-2xl font-bold">
              {Math.round(roast.items.reduce((a, r) => a + r.rating, 0) / roast.items.length)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Average Score / 10</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Roast Items */}
      <motion.div variants={itemVariants} className="space-y-4">
        {displayed.map((roastItem) => {
          const config = severityConfig[roastItem.severity];
          const isExpanded = expanded === roastItem.category;

          return (
            <Card
              key={roastItem.category}
              className={`hover:shadow-lg transition-all duration-300 overflow-hidden ${config.bg} ${config.border}`}
            >
              <CardContent className="p-0">
                <button
                  onClick={() => setExpanded(isExpanded ? null : roastItem.category)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold">{roastItem.category}</h3>
                        <Badge
                          variant={roastItem.severity === "high" ? "destructive" : "warning"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                            <div
                              key={star}
                              className={`h-1.5 w-1.5 rounded-full ${
                                star <= roastItem.rating
                                  ? "bg-amber-400"
                                  : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {roastItem.rating}/10
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0">
                        <div className="rounded-xl bg-white/[0.02] border border-glass-border p-4">
                          <p className="text-sm text-muted-foreground leading-relaxed italic">
                            &ldquo;{roastItem.feedback}&rdquo;
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Show more / less */}
      <motion.div variants={itemVariants} className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-muted-foreground"
        >
          {showAll ? "Show Critical Only" : `Show All (${roast.items.length} items)`}
        </Button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">AI Roast Session</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This feedback is generated by AI analyzing your startup data. We&apos;re intentionally
                harsh because tough love builds better companies. Take what resonates, ignore what doesn&apos;t.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
