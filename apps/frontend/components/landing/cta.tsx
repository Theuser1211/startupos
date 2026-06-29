"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs text-muted-foreground font-mono mb-4">
          // ship.sh
        </p>
        <h2 className="text-lg font-semibold mb-3">Try it</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
          Free tier. No credit card. Full workspace. I don&apos;t have a
          premium plan because I haven&apos;t figured out pricing yet.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            href="/interview"
            className="inline-flex items-center px-5 py-2.5 text-sm font-mono bg-primary text-primary-foreground hover:bg-primary/90 rounded"
          >
            Try it
          </Link>
          <Link
            href="https://github.com/startupos"
            className="inline-flex items-center px-5 py-2.5 text-sm font-mono border border-border text-muted-foreground hover:text-foreground rounded"
          >
            GitHub
          </Link>
        </div>

        <p className="mt-6 text-[11px] font-mono text-muted-foreground/50">
          built by a student with too much free time
        </p>
      </div>
    </section>
  );
}
