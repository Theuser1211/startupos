"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { StartupBlueprint } from "@/lib/types";

export function RevenueTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  if (!blueprint) {
    return (
      <EmptyState icon={DollarSign} title="No revenue data yet" description="Complete the founder interview to see AI-generated financial projections." actionLabel="Start Interview" actionHref="/interview" />
    );
  }

  const { revenue } = blueprint;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Revenue Model</h1>
        <p className="text-sm text-muted-foreground font-mono">{revenue.model}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold font-mono mb-1">{revenue.pricing}</p>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">{revenue.justification}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Funding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-mono font-medium">{revenue.funding}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-mono text-muted-foreground leading-relaxed">{revenue.analysis}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
