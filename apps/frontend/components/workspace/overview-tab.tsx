"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Lightbulb, Users, TrendingUp, BarChart3, LayoutDashboard, Star,
} from "lucide-react";
import type { StartupBlueprint } from "@/lib/types";

const iconMap: Record<string, typeof Star> = {
  positive: Lightbulb,
  opportunity: TrendingUp,
  warning: BarChart3,
  action: Users,
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

  const { startupName, companySnapshot, insights } = blueprint;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {startupName || "Untitled Startup"}
        </h1>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Insights</h2>
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
                className={`rounded border p-5 ${typeColors[insight.type]}`}
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
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Snapshot</CardTitle>
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
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-sm font-medium font-mono">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
