"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 border border-border rounded overflow-hidden">
          <img
            src="/product-screenshot.png"
            alt="StartupOS workspace"
            className="w-full h-auto block"
          />
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold leading-relaxed mb-3">
          StartupOS
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-lg">
          A tool that forces you to think through your startup idea before
          building it. Answers a few questions, get a verdict, generate a
          website. Built because I kept starting projects and abandoning
          them after 3 days.
        </p>

        <Link
          href="/interview"
          className="inline-flex items-center px-4 py-2 text-sm font-mono bg-primary text-primary-foreground hover:bg-primary/90 rounded"
        >
          Start the interview
        </Link>
      </div>
    </section>
  );
}
