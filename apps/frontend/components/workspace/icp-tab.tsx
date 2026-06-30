"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Target } from "lucide-react";
import type { StartupBlueprint } from "@/lib/types";

export function ICPTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  if (!blueprint) {
    return (
      <EmptyState
        icon={Target}
        title="No customer profile yet"
        description="Complete the founder interview to see your ideal customer profile."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { icp } = blueprint;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Ideal Customer Profile</h1>
        <p className="text-sm text-muted-foreground">{icp.title}</p>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Persona Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3 mb-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-mono font-medium">{icp.role}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Company Size</p>
                <p className="text-sm font-mono font-medium">{icp.companySize}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-sm font-mono">{icp.title}</p>
              </div>
            </div>
            <p className="text-sm font-mono text-muted-foreground leading-relaxed">{icp.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <Card className="h-full border-emerald-500/20 bg-[#0d0d10]">
            <CardHeader>
              <CardTitle className="text-sm">Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {icp.goals.map((goal, i) => (
                  <li key={i} className="text-sm font-mono text-muted-foreground">{goal}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full border-red-500/20 bg-[#0d0d10]">
            <CardHeader>
              <CardTitle className="text-sm">Pain Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {icp.painPoints.map((point, i) => (
                  <li key={i} className="text-sm font-mono text-muted-foreground">{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full border-amber-500/20 bg-[#0d0d10]">
            <CardHeader>
              <CardTitle className="text-sm">Objections</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {icp.objections.map((obj, i) => (
                  <li key={i} className="text-sm font-mono text-muted-foreground">{obj}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <Card className="border-primary/20 bg-[#0d0d10]">
          <CardHeader>
            <CardTitle className="text-sm">Recommendations</CardTitle>
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
      </div>
    </div>
  );
}
