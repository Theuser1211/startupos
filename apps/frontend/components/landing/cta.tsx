"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-lg font-semibold mb-3">Try it</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
          Free. No signup required to start the interview. Full workspace
          if you create an account.
        </p>

        <Link
          href="/interview"
          className="inline-flex items-center px-5 py-2.5 text-sm font-mono bg-primary text-primary-foreground hover:bg-primary/90 rounded"
        >
          Start the interview
        </Link>

        <p className="mt-6 text-xs font-mono text-muted-foreground/50">
          built by a student with too much free time
        </p>
      </div>
    </section>
  );
}
