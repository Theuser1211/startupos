"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Palette } from "lucide-react";
import type { StartupBlueprint } from "@/lib/types";

export function BrandTab({ blueprint }: { blueprint?: StartupBlueprint | null }) {
  if (!blueprint) {
    return (
      <EmptyState
        icon={Palette}
        title="No brand guidelines yet"
        description="Complete the founder interview to see your brand identity."
        actionLabel="Start Interview"
        actionHref="/interview"
      />
    );
  }

  const { mission, values, tone, colors, typography } = blueprint.brand;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Brand Identity</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Mission & Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mission</p>
                <p className="text-sm font-mono leading-relaxed">{mission}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Core Values</p>
                <div className="flex flex-wrap gap-2">
                  {values.map((v) => (
                    <Badge key={v} variant="outline" className="text-xs border-primary/20 text-primary font-mono">{v}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">Tone of Voice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tone.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs font-mono">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {colors.map((color) => (
                <div key={color.name} className="space-y-2">
                  <div
                    className="h-20 rounded border border-primary/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="text-xs font-mono font-medium">{color.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Typography</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 rounded border border-primary/10 bg-[#0d0d10] p-4">
                <p className="text-xs text-muted-foreground">Heading Font</p>
                <p className="text-lg font-bold">{typography.heading}</p>
              </div>
              <div className="space-y-2 rounded border border-primary/10 bg-[#0d0d10] p-4">
                <p className="text-xs text-muted-foreground">Body Font</p>
                <p className="text-sm font-mono">{typography.body}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
