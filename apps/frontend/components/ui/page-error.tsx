"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Terminal, RefreshCw } from "lucide-react";

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
      <div className="terminal-window max-w-lg w-full">
        <div className="terminal-window-titlebar">
          <div className="flex items-center gap-1.5">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-yellow" />
            <div className="terminal-dot terminal-dot-green" />
          </div>
          <span className="font-mono text-xs text-muted-foreground ml-3">
            startupos — crash report
          </span>
        </div>
        <div className="p-8 text-center">
          <Terminal className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-display font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-2 font-mono text-xs">
            {error.message || "The application encountered an unexpected error."}
          </p>
          {title && (
            <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
              Error in: {title}
            </p>
          )}
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
