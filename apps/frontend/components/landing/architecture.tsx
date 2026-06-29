"use client";

export function ArchitectureSection() {
  return (
    <section className="py-16 px-6 border-t border-border">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs text-muted-foreground font-mono mb-4">
          // stack.txt
        </p>
        <h2 className="text-lg font-semibold mb-4">Architecture</h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Nothing fancy. Just whatever worked at 2am.
        </p>

        <div className="border border-border rounded font-mono text-xs overflow-x-auto">
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-card">
            <div className="flex gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-muted-foreground ml-2">package.json</span>
          </div>
          <div className="p-4 text-muted-foreground space-y-1.5">
            <div className="text-primary">$ tree . --depth 2</div>
            <div className="text-muted-foreground/80">
              <div>startupos/</div>
              <div className="pl-4">├── apps/</div>
              <div className="pl-8">├── frontend/  <span className="text-muted-foreground/50">// Next.js, Tailwind</span></div>
              <div className="pl-8">├── backend/   <span className="text-muted-foreground/50">// Express, Prisma, SQLite</span></div>
              <div className="pl-4">├── packages/</div>
              <div className="pl-8">├── shared/    <span className="text-muted-foreground/50">// Types I reuse everywhere</span></div>
              <div className="pl-4">├── AI stuff</div>
              <div className="pl-8">├── provider chain with fallback</div>
              <div className="pl-8">├── 60s timeout each</div>
              <div className="pl-8">├── hardcoded fallback if all fail</div>
              <div className="pl-4">└── package.json</div>
            </div>
            <div className="text-primary/60 mt-3">$ echo "works on my machine"</div>
            <div className="text-muted-foreground">works on my machine</div>
          </div>
        </div>

        <div className="mt-4 text-[11px] font-mono text-muted-foreground/50 text-center">
          // deployed via Railway. probably overengineered for what it does.
        </div>
      </div>
    </section>
  );
}
