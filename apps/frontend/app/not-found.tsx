"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Terminal, ArrowLeft } from "lucide-react";

export default function NotFound() {
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
            startupos — 404
          </span>
        </div>
        <div className="p-8 text-center">
          <Terminal className="h-8 w-8 text-warning mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2 font-mono">$ ls: no such file or directory</h2>
          <p className="text-sm text-muted-foreground mb-6 font-mono">
            The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => window.history.back()} className="gap-2 font-mono text-xs">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Link href="/">
              <Button className="gap-2 font-mono text-xs">
                <Terminal className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
