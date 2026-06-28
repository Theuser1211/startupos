"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, CheckCircle2, TrendingUp, Frown, UserCheck } from "lucide-react";
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

export function ICPTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  if (!blueprint) {
    return (
      <EmptyState
        icon={Target}
        title="No customer profile yet"
        description="Complete the founder interview to see your AI-defined ideal customer profile."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { icp } = blueprint;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 border border-primary/20">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold"><span className="text-primary font-mono text-xl">$</span> Ideal Customer Profile</h1>
            <p className="text-sm text-muted-foreground font-mono text-xs">{icp.title}</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className=" hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> Persona Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3 mb-6">
              <div className="space-y-1">
                <p className="mono-label text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-mono font-medium">{icp.role}</p>
              </div>
              <div className="space-y-1">
                <p className="mono-label text-xs text-muted-foreground">Company Size</p>
                <p className="text-sm font-mono font-medium">{icp.companySize}</p>
              </div>
              <div className="space-y-1">
                <p className="mono-label text-xs text-muted-foreground">Target</p>
                <Badge variant="default" className="text-xs font-mono">{icp.title}</Badge>
              </div>
            </div>
            <p className="text-sm font-mono text-muted-foreground leading-relaxed">{icp.description}</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className=" h-full border-emerald-500/20 bg-[#0d0d10] hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm mono-label"><span className="text-emerald-400 mr-1">{">"}</span> Goals</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {icp.goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-mono text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className=" h-full border-red-500/20 bg-[#0d0d10] hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Frown className="h-4 w-4 text-red-400" />
                <CardTitle className="text-sm mono-label"><span className="text-red-400 mr-1">!</span> Pain Points</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {icp.painPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-mono text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className=" h-full border-amber-500/20 bg-[#0d0d10] hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-amber-400" />
                <CardTitle className="text-sm mono-label"><span className="text-amber-400 mr-1">?</span> Objections</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {icp.objections.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-mono text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className=" border-primary/20 bg-[#0d0d10] hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm mono-label"><span className="text-primary mr-1">$</span> Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {icp.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-mono text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 border border-primary/20 text-[10px] font-mono font-bold text-primary">{i + 1}</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
