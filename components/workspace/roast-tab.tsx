"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { StartupBlueprint } from "@/lib/types";

const severityConfig = {
  high: { color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/20", label: "Critical" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20", label: "Warning" },
  low: { color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20", label: "Suggestion" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function RoastTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  const [showAll, setShowAll] = useState(false);

  if (!blueprint) {
    return (
      <EmptyState icon={Flame} title="No roast yet" description="Complete the founder interview to get brutally honest AI feedback." actionLabel="Start Interview" actionHref="/interview" />
    );
  }

  const { roast } = blueprint;
  const displayed = showAll ? roast.items : roast.items.filter((r) => r.severity === "high" || r.severity === "medium");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Startup Roast</h1>
            <p className="text-sm text-muted-foreground">Brutally honest AI feedback</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-red-500/20 bg-red-500/[0.02]">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-500" />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-500/30">
                  <span className="text-3xl font-bold text-white">{roast.score}</span>
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Flame className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-display font-bold">Roast Score: {roast.score}/100</h2>
                  <Badge variant="destructive" className="text-xs">{roast.verdict}</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{roast.verdict}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-display font-bold">Findings</h2>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Showing {displayed.length} of {roast.items.length}
          </Badge>
        </div>
        <div className="space-y-3">
          {displayed.map((item, i) => {
            const config = severityConfig[item.severity];
            return (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={`rounded-xl border ${config.border} ${config.bg} p-4 transition-all duration-300 hover:shadow-lg`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${config.border} ${config.bg}`}>
                    <Flame className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{item.category}</span>
                      <Badge variant={item.severity === "high" ? "destructive" : item.severity === "medium" ? "warning" : "outline"} className="text-[9px] px-1 py-0">{config.label}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{item.rating}/10</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.feedback}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {roast.items.length > 2 && (
          <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className="mt-3 gap-2">
            {showAll ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</> : <><ChevronDown className="h-3.5 w-3.5" /> Show all {roast.items.length} findings</>}
          </Button>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="h-full border-red-500/20 bg-red-500/[0.02] hover:shadow-lg transition-all duration-300">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-red-400 mb-3">Risks</h3>
              <ul className="space-y-2">
                {roast.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full border-emerald-500/20 bg-emerald-500/[0.02] hover:shadow-lg transition-all duration-300">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-emerald-400 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {roast.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{rec}</span>
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
