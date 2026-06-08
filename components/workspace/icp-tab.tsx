"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { Target, AlertTriangle, CheckCircle2, TrendingUp, Frown, UserCheck } from "lucide-react";
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

export function ICPTab() {
  const { blueprint } = useBlueprint();
  if (!blueprint) {
    return (
      <EmptyState
        icon={Target}
        title="No customer profile yet"
        description="Complete the founder interview to see your AI-defined ideal customer profile with pain points, goals, and targeted recommendations."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { icp } = blueprint;

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Ideal Customer Profile</h1>
            <p className="text-muted-foreground text-sm">AI-defined target persona</p>
          </div>
        </div>
      </motion.div>

      {/* Persona Card */}
      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">{icp.title}</h2>
                <p className="text-sm text-muted-foreground">{icp.role}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {icp.companySize}
                </Badge>
              </div>
            </div>

            {/* Pain Points */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Frown className="h-4 w-4 text-red-400" />
                <h3 className="text-sm font-semibold">Pain Points</h3>
              </div>
              <ul className="space-y-2">
                {icp.painPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Goals */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold">Goals</h3>
              </div>
              <ul className="space-y-2">
                {icp.goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Objections */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold">Common Objections</h3>
              </div>
              <ul className="space-y-2">
                {icp.objections.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-sm text-muted-foreground italic">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Tips */}
      <motion.div variants={itemVariants}>
        <Card className="hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">AI-Powered Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {icp.recommendations.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-glass-border">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
