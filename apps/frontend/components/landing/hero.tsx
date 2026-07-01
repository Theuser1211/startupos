"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 border border-border rounded-sm overflow-hidden font-mono text-xs bg-[#0d0d10]">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-card">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            <span className="ml-2 text-[10px] text-muted-foreground">workspace — StartupOS</span>
          </div>
          <div className="flex border-b border-border">
            <div className="px-3 py-1.5 border-r border-border text-primary">Overview</div>
            <div className="px-3 py-1.5 border-r border-border text-muted-foreground">Website</div>
            <div className="px-3 py-1.5 border-r border-border text-muted-foreground">Brand</div>
            <div className="px-3 py-1.5 text-muted-foreground">ICP</div>
          </div>
          <div className="p-4 space-y-2">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
            <div className="pt-2 space-y-1.5">
              <div className="h-2.5 w-1/3 bg-primary/20 rounded" />
              <div className="h-2.5 w-full bg-muted rounded" />
              <div className="h-2.5 w-5/6 bg-muted rounded" />
            </div>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold leading-relaxed mb-3">
          StartupOS
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-lg">
          A tool that forces you to think through your startup idea before
          building it. Answers a few questions, get a verdict, generate a
          website. Built because I kept starting projects and abandoning
          them after 3 days.
        </p>

        <Link
          href="/interview"
          className="inline-flex items-center px-4 py-2 text-sm font-mono bg-primary text-primary-foreground hover:bg-primary/90 rounded"
        >
          Start the interview
        </Link>
      </div>
    </section>
  );
}
