"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function PageErrorFallback({ error, reset, title }: PageErrorProps) {
  useEffect(() => {
    console.error(`[PageError] ${title || "Page"}:`, error);
  }, [error, title]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full border border-border bg-card rounded p-8 text-center">
        <h2 className="text-lg font-sans font-semibold mb-2">Something went wrong</h2>
        <p className="text-xs font-mono text-muted-foreground mb-2">
          {error.message || "The application encountered an unexpected error."}
        </p>
        {title && (
          <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
            Error in: {title}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
