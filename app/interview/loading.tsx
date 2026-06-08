import { Sparkles } from "lucide-react";

export default function InterviewLoading() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px]" />

      {/* Header skeleton */}
      <div className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-indigo-600">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold">
              Startup<span className="text-primary">OS</span>
            </span>
          </div>
          <div className="h-5 w-24 rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>

      {/* Progress bar skeleton */}
      <div className="fixed top-14 left-0 right-0 h-0.5 bg-white/5 z-40">
        <div className="h-full w-1/4 bg-gradient-to-r from-purple-500 to-indigo-500" />
      </div>

      {/* Form skeleton */}
      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="space-y-8">
          <div>
            <div className="h-8 w-64 rounded-lg bg-white/5 animate-pulse mb-2" />
            <div className="h-4 w-80 rounded-lg bg-white/5 animate-pulse" />
          </div>
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 w-24 rounded bg-white/5 animate-pulse mb-2" />
                <div className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4">
            <div className="h-10 w-20 rounded-xl bg-white/5 animate-pulse" />
            <div className="h-10 w-28 rounded-xl bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-center px-6">
          <div className="h-3 w-48 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
