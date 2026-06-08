"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBlueprint } from "@/lib/startup/blueprint-context";
import { Map, CheckCircle2, CircleDot, Circle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const statusConfig = {
  done: { icon: CheckCircle2, color: "text-emerald-400", label: "Done", badge: "success" as const },
  "in-progress": { icon: CircleDot, color: "text-blue-400", label: "In Progress", badge: "default" as const },
  planned: { icon: Circle, color: "text-muted-foreground", label: "Planned", badge: "outline" as const },
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

export function RoadmapTab() {
  const { blueprint } = useBlueprint();
  if (!blueprint) {
    return (
      <EmptyState
        icon={Map}
        title="No roadmap yet"
        description="Complete the founder interview to see your AI-generated product roadmap with milestones, timelines, and strategic phases."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { roadmap } = blueprint;

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Map className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Product Roadmap</h1>
            <p className="text-muted-foreground text-sm">AI-generated strategic timeline</p>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

        <div className="space-y-8">
          {roadmap.map((phase, qIdx) => (
            <motion.div key={phase.quarter} variants={itemVariants}>
              {/* Phase Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/20">
                  <span className="text-xs font-bold text-white">{qIdx + 1}</span>
                </div>
                <h2 className="text-lg font-display font-bold">{phase.quarter}</h2>
                <Badge variant="outline" className="text-xs ml-auto">
                  {phase.items.length} milestones
                </Badge>
              </div>

              {/* Items */}
              <div className="ml-12 space-y-3">
                {phase.items.map((item, iIdx) => {
                  const config = statusConfig[item.status];
                  const Icon = config.icon;
                  return (
                    <Card
                      key={iIdx}
                      className={`hover:border-primary/20 transition-all duration-300 ${
                        item.status === "done" ? "opacity-80" : ""
                      }`}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium">{item.title}</h3>
                            <Badge variant={config.badge} className="text-[10px] px-1.5 py-0">
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
