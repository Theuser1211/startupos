"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="mx-auto max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} StartupOS
          </span>
          <Link href="/privacy" className="font-mono text-xs text-muted-foreground/50 hover:text-muted-foreground">
            privacy
          </Link>
          <Link href="/terms" className="font-mono text-xs text-muted-foreground/50 hover:text-muted-foreground">
            terms
          </Link>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground/30">
          // ship fast. break things. fix them later.
        </p>
      </div>
    </footer>
  );
}
