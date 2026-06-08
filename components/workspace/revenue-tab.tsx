"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { DollarSign, TrendingUp, Calendar, PiggyBank, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useState } from "react";

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

export function RevenueTab() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { blueprint } = useBlueprint();
  if (!blueprint) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No revenue data yet"
        description="Complete the founder interview to see AI-generated financial projections, funding insights, and unit economics analysis."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { revenue } = blueprint;
  const maxRevenue = Math.max(...revenue.projections.map((r) => r.projected), 1);
  const lastProjection = revenue.projections[revenue.projections.length - 1];
  const eoyTarget = lastProjection?.projected || 0;

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Revenue Projections</h1>
            <p className="text-muted-foreground text-sm">AI-generated financial forecast</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Projected EOY</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">${eoyTarget.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">ARR target by EOY</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Current</span>
            </div>
            <p className="text-2xl font-bold">$0</p>
            <p className="text-xs text-muted-foreground mt-1">Pre-revenue stage</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <PiggyBank className="h-4 w-4" />
              <span className="text-xs">Funding</span>
            </div>
            <p className="text-2xl font-bold">{revenue.funding}</p>
            <p className="text-xs text-muted-foreground mt-1">{blueprint.companySnapshot.stage} capital</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart */}
      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Monthly Projections</CardTitle>
              <Badge variant="outline" className="text-xs">
                {new Date().getFullYear()} Forecast
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48 pt-4 pb-2">
              {revenue.projections.map((item, i) => {
                const height = Math.max((item.projected / maxRevenue) * 100, 2);
                const isHovered = hoveredIndex === i;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="relative w-full flex justify-center">
                      {isHovered && (
                        <div className="absolute -top-8 bg-white/10 backdrop-blur-xl border border-glass-border rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap z-10">
                          ${item.projected.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                      className={`w-full rounded-md transition-all duration-300 ${
                        item.projected === 0
                          ? "bg-white/5"
                          : "bg-gradient-to-t from-primary/30 to-primary/60"
                      } ${isHovered ? "opacity-100 scale-105" : "opacity-80"}`}
                    />
                    <span className="text-[10px] text-muted-foreground mt-1">{item.month}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-glass-border">
              <div className="flex items-center gap-2">
                <div className="h-2 w-4 rounded bg-gradient-to-r from-primary/30 to-primary/60" />
                <span className="text-xs text-muted-foreground">Projected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-4 rounded bg-white/5" />
                <span className="text-xs text-muted-foreground">No Data Yet</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Note */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">AI Analysis</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{revenue.analysis}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
