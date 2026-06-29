"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Target, Lightbulb, Users, TrendingUp, Star, Shield, BarChart3, LayoutDashboard,
} from "lucide-react";
import type { StartupBlueprint } from "@/lib/types";

const iconMap: Record<string, typeof Star> = {
  positive: Lightbulb,
  opportunity: TrendingUp,
  warning: BarChart3,
  action: Users,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function OverviewTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  if (!blueprint) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="No blueprint loaded"
        description="Complete the founder interview to see your personalized dashboard."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { startupName, companySnapshot, stats, insights } = blueprint;

  const statCards = [
    { label: "Brand Score", value: `${stats.brandScore}`, icon: Star, color: "from-green-500 to-emerald-600", change: "+8" },
    { label: "Market Fit", value: stats.marketFit, icon: Target, color: "from-blue-500 to-cyan-600", change: "+2" },
    { label: "Readiness", value: `${stats.readiness}%`, icon: Shield, color: "from-emerald-500 to-teal-600", change: "+12%" },
    { label: "Growth Score", value: `${stats.growthScore}`, icon: TrendingUp, color: "from-amber-500 to-orange-600", change: "+5" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-primary font-mono text-lg crt-glow">$</span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back{startupName ? `, ${startupName.split(" ")[0]}` : ""}
          </h1>
        </div>
        <p className="text-muted-foreground mt-1 font-mono text-xs">
          $ cat ~/startup/{startupName || "dashboard"}/overview
        </p>
        <p className="text-muted-foreground/30 mt-1 font-mono text-[10px] italic">
          // still here? good. persistence beats talent.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className=" hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg border border-primary/10`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">
                    +{stat.change}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-4 mono-label"><span className="text-primary mr-2">$</span> AI Insights</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {insights.map((insight) => {
            const Icon = iconMap[insight.type] || Lightbulb;
            const typeColors: Record<string, string> = {
              positive: "border-emerald-500/20 bg-emerald-500/5",
              opportunity: "border-blue-500/20 bg-blue-500/5",
              warning: "border-amber-500/20 bg-amber-500/5",
              action: "border-emerald-500/20 bg-emerald-500/5",
            };
            const iconColors: Record<string, string> = {
              positive: "text-emerald-400",
              opportunity: "text-blue-400",
              warning: "text-amber-400",
              action: "text-emerald-400",
            };
            return (
              <div
                key={insight.title}
                className={`rounded-xl border p-5 ${typeColors[insight.type]} transition-all duration-300 hover:shadow-lg`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColors[insight.type]}`} />
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className=" hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg mono-label"><span className="text-primary mr-2">$</span> Company Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { label: "Company", value: startupName },
                { label: "Stage", value: companySnapshot.stage },
                { label: "Industry", value: companySnapshot.industry },
                { label: "Funding", value: companySnapshot.funding },
                { label: "Team Size", value: `${companySnapshot.teamSize} people` },
                { label: "Founded", value: companySnapshot.foundedDate },
              ].map((item) => (
                <div key={item.label}>
                  <p className="mono-label text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-sm font-medium font-mono">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
