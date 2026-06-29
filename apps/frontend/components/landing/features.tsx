"use client";

import { MessageSquare, Target, Route, BarChart3, Palette, Flame } from "lucide-react";

interface Feature {
  icon: typeof MessageSquare;
  title: string;
  description: string;
  note: string;
}

const features: Feature[] = [
  {
    icon: MessageSquare,
    title: "Founder Interview",
    description: "Walks you through 18 questions about your idea. Market, users, business model, competitors. The stuff you'd normally skip.",
    note: "still less painful than spreadsheets",
  },
  {
    icon: Target,
    title: "ICP Builder",
    description: "Figure out who your customer actually is. Age, job title, what keeps them up at night. Not who you think they are.",
    note: "spoiler: it's not everyone",
  },
  {
    icon: Route,
    title: "Smart Roadmap",
    description: "Generates a roadmap from your answers. Updates when you change your mind. Because Notion docs rot.",
    note: "probably overengineered",
  },
  {
    icon: BarChart3,
    title: "Revenue Modeling",
    description: "Unit economics. Pricing tiers. Break-even. Spreadsheets are great, but I wanted something lazier.",
    note: "does not guarantee profit",
  },
  {
    icon: Palette,
    title: "Brand Generator",
    description: "Creates brand guidelines from your positioning. Colors, fonts, voice. Makes your landing page look less like a template.",
    note: "yes, another AI app",
  },
  {
    icon: Flame,
    title: "Startup Roast",
    description: "Brutally honest feedback on your idea. No padding. No sugar-coating. Your mom won't say these things.",
    note: "reader discretion advised",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 px-6 border-t border-border">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs text-muted-foreground font-mono mb-4">
          // features.md
        </p>
        <h2 className="text-lg font-semibold mb-8">What it does</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="border border-border rounded p-4 hover:border-muted-foreground/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="text-sm font-medium">{feature.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {feature.description}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/50 italic">
                  // {feature.note}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
