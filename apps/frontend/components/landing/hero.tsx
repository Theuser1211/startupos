"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 border border-border rounded overflow-hidden">
          <img
            src="/product-screenshot.png"
            alt="StartupOS workspace screenshot"
            className="w-full h-auto block"
          />
        </div>

        <p className="text-sm text-muted-foreground font-mono mb-2">
          // hello.txt
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold leading-relaxed mb-6">
          I built this because every project I started died after 3 days.
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-lg">
          So I made a tool that forces me to think through an idea before
          wasting a week building it. Works on my machine.
        </p>

        <div className="flex gap-3">
          <Link
            href="/interview"
            className="inline-flex items-center px-4 py-2 text-sm font-mono bg-primary text-primary-foreground hover:bg-primary/90 rounded"
          >
            Try it
          </Link>
          <Link
            href="https://github.com/startupos"
            className="inline-flex items-center px-4 py-2 text-sm font-mono border border-border text-muted-foreground hover:text-foreground rounded"
          >
            GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}
