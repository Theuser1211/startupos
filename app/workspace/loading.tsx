import { Sparkles } from "lucide-react";

export default function WorkspaceLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-glass-border bg-background/50">
        <div className="flex items-center gap-2 h-14 px-5 border-b border-glass-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            Startup<span className="text-primary">OS</span>
          </span>
        </div>

        <div className="px-5 py-4 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
              <div className="h-2.5 w-12 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <div className="h-4 w-4 rounded bg-white/5 animate-pulse" />
              <div className="h-3 w-16 rounded bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile header skeleton */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-strong border-b border-glass-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="h-8 w-8 rounded-lg border border-glass-border bg-white/5 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600" />
          </div>
          <div className="h-3 w-8 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="flex gap-1 p-2 border-t border-glass-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-16 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="flex-1 min-h-screen lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-12 pb-16">
          {/* Welcome */}
          <div className="space-y-2 mb-10">
            <div className="h-9 w-72 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-4 w-56 rounded bg-white/5 animate-pulse" />
          </div>

          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl p-5 space-y-4"
              >
                <div className="flex justify-between">
                  <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
                  <div className="h-5 w-10 rounded-full bg-white/5 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-7 w-16 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="space-y-4">
            <div className="h-5 w-24 rounded bg-white/5 animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-glass-border p-5 space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded bg-white/5 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
                      <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
                      <div className="h-3 w-3/4 rounded bg-white/5 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
