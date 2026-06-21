"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, CheckCircle2, CircleDot, Circle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { StartupBlueprint } from "@/lib/types";

const statusConfig = {
  done: { icon: CheckCircle2, color: "text-emerald-400", label: "Done", badge: "success" as const },
  "in-progress": { icon: CircleDot, color: "text-blue-400", label: "In Progress", badge: "default" as const },
  planned: { icon: Circle, color: "text-muted-foreground", label: "Planned", badge: "outline" as const },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function RoadmapTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  if (!blueprint) {
    return (
      <EmptyState icon={Map} title="No roadmap yet" description="Complete the founder interview to see your AI-generated product roadmap." actionLabel="Start Interview" actionHref="/interview" />
    );
  }

  const { roadmap } = blueprint;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <Map className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Product Roadmap</h1>
            <p className="text-sm text-muted-foreground">{roadmap.length} quarters planned</p>
          </div>
        </div>
      </motion.div>

      <div className="relative">
        <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 to-transparent" />

        <div className="space-y-8">
          {roadmap.map((quarter, qi) => (
            <motion.div key={quarter.quarter} variants={itemVariants} className="relative pl-14">
              <div className="absolute left-[18px] top-1.5 h-[18px] w-[18px] rounded-full border-2 border-primary/40 bg-background flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary/60" />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-display font-bold">{quarter.quarter}</h2>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{quarter.items.length} items</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {quarter.items.map((item, ii) => {
                  const config = statusConfig[item.status];
                  const Icon = config.icon;
                  return (
                    <Card key={ii} className="hover:border-primary/20 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{item.title}</p>
                              <Badge variant={config.badge} className="text-[9px] px-1 py-0">{config.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                          </div>
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
