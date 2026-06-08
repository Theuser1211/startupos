"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (minimal) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-glass-border bg-background/50">
        <div className="flex items-center gap-2 h-14 px-5 border-b border-glass-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            Startup<span className="text-primary">OS</span>
          </span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-xl shadow-red-500/20">
            <span className="text-3xl">⚠️</span>
          </div>

          <h1 className="text-3xl font-display font-bold mb-3">Workspace Error</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Something went wrong while loading your workspace. Don&apos;t worry —
            your data is safe. Please try again.
          </p>

          {error.digest && (
            <p className="text-xs text-muted-foreground mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={reset} className="glow-purple gap-2">
              <RefreshCw className="h-4 w-4" />
              Reload Workspace
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Back Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
