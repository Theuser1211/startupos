export default function PublicBlueprintLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 rounded bg-white/5 animate-pulse" />
          <div className="h-10 w-64 mt-4 rounded bg-white/5 animate-pulse" />
          <div className="h-6 w-96 mt-2 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Verdict skeleton */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 mb-6">
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 rounded bg-white/5 animate-pulse" />
            <div className="h-8 w-20 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="h-8 w-16 mt-4 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-full mt-2 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Roadmap skeleton */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5 mb-6">
          <div className="h-6 w-24 rounded bg-white/5 animate-pulse" />
          <div className="space-y-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-48 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-64 mt-1 rounded bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roast skeleton */}
        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="h-6 w-16 rounded bg-white/5 animate-pulse" />
            <div className="h-8 w-12 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="h-4 w-full mt-4 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-3/4 mt-2 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
