"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function InterviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px]" />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-indigo-600">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold">
              Startup<span className="text-primary">OS</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Error card */}
      <div className="relative z-10 w-full max-w-md px-6 text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-xl shadow-red-500/20">
          <span className="text-3xl">⚠️</span>
        </div>

        <h1 className="text-3xl font-display font-bold mb-3">Something went wrong</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          We encountered an issue while setting up your founder interview.
          This is on us — please try again.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset} className="glow-purple gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
