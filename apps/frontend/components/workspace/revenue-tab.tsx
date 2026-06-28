"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, PiggyBank, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useState } from "react";
import type { StartupBlueprint } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function RevenueTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!blueprint) {
    return (
      <EmptyState icon={DollarSign} title="No revenue data yet" description="Complete the founder interview to see AI-generated financial projections." actionLabel="Start Interview" actionHref="/interview" />
    );
  }

  const { revenue } = blueprint;
  const maxRevenue = Math.max(...revenue.projections.map((r) => r.projected), 1);
  const lastProjection = revenue.projections[revenue.projections.length - 1];
  const eoyTarget = lastProjection?.projected || 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/20">
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold"><span className="text-emerald-400 font-mono text-xl">$</span> Revenue Model</h1>
            <p className="text-sm text-muted-foreground font-mono text-xs">{revenue.model}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="terminal-card h-full hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> Pricing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold font-mono mb-1">{revenue.pricing}</p>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">{revenue.justification}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="terminal-card h-full hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> EOY Target</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold font-mono text-emerald-400">${eoyTarget.toLocaleString()}</p>
              <p className="text-xs font-mono text-muted-foreground">Projected annual recurring revenue</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="terminal-card h-full hover:border-primary/20 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> Funding</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-mono font-medium">{revenue.funding}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="terminal-card hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> Revenue Projections</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {revenue.projections.map((proj, i) => {
                const height = (proj.projected / maxRevenue) * 100;
                const isHovered = hoveredIndex === i;
                return (
                  <div
                    key={proj.month}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                      className={`w-full rounded transition-all duration-300 relative ${
                        proj.actual !== null
                          ? "bg-emerald-500/80"
                          : "bg-emerald-500/20"
                      } ${isHovered ? "scale-105 shadow-lg shadow-emerald-500/30" : ""}`}
                    >
                      {isHovered && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0d0d10] border border-primary/20 rounded px-2 py-1 text-xs font-mono font-medium whitespace-nowrap z-10">
                          ${proj.projected.toLocaleString()}
                        </div>
                      )}
                    </motion.div>
                    <span className="text-[10px] font-mono text-muted-foreground mt-1">{proj.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-emerald-500/80" />
                <span>Projected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-emerald-500/20" />
                <span>Future project</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="terminal-card hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono text-muted-foreground leading-relaxed">{revenue.analysis}</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
