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
          <div className="flex h-10 w-10 items-center justify-center rounded bg-red-500/10 border border-red-500/20">
            <Flame className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold"><span className="text-red-400 font-mono text-xl">!</span> Startup Roast</h1>
            <p className="text-sm text-muted-foreground font-mono text-xs">$ ./roast --brutal</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="terminal-card relative overflow-hidden border-red-500/20 bg-[#0d0d10]">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-500" />
          <div className="terminal-panel-header flex items-center gap-2 px-4 py-1.5 border-b border-red-500/10 bg-[#0d0d10]">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] text-muted-foreground font-mono ml-2">$ ./roast --diagnostic</span>
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded bg-red-500/10 border border-red-500/30">
                  <span className="text-3xl font-bold font-mono text-red-400">{roast.score}</span>
                </div>
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <Flame className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-red-400">$ score</span>
                  <h2 className="text-xl font-bold">Roast Score: {roast.score}/100</h2>
                  <Badge variant="destructive" className="text-xs font-mono">{roast.verdict}</Badge>
                </div>
                <p className="text-sm font-mono text-muted-foreground leading-relaxed">{roast.verdict}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-bold mono-label"><span className="text-red-400 mr-2">!</span> Findings</h2>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
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
                className={`rounded border ${config.border} bg-[#0d0d10] p-4 transition-all duration-300 hover:shadow-lg`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border ${config.border} ${config.bg}`}>
                    <Flame className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono font-semibold">{item.category}</span>
                      <Badge variant={item.severity === "high" ? "destructive" : item.severity === "medium" ? "warning" : "outline"} className="text-[9px] px-1 py-0 font-mono">{config.label}</Badge>
                      <span className="text-xs font-mono text-muted-foreground ml-auto">{item.rating}/10</span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground leading-relaxed">{item.feedback}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {roast.items.length > 2 && (
          <Button variant="ghost" size="sm" className="font-mono mt-3 gap-2" onClick={() => setShowAll(!showAll)}>
            {showAll ? <><ChevronUp className="h-3.5 w-3.5" /> $ less</> : <><ChevronDown className="h-3.5 w-3.5" /> $ show_all --findings</>}
          </Button>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="terminal-card h-full border-red-500/20 bg-[#0d0d10] hover:shadow-lg transition-all duration-300">
            <CardContent className="p-5">
              <h3 className="text-sm font-mono font-semibold text-red-400 mb-3"><span className="text-red-400 mr-1">!</span> Risks</h3>
              <ul className="space-y-2">
                {roast.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-mono text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="terminal-card h-full border-emerald-500/20 bg-[#0d0d10] hover:shadow-lg transition-all duration-300">
            <CardContent className="p-5">
              <h3 className="text-sm font-mono font-semibold text-emerald-400 mb-3"><span className="text-emerald-400 mr-1">$</span> Recommendations</h3>
              <ul className="space-y-2">
                {roast.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-mono text-muted-foreground">
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
