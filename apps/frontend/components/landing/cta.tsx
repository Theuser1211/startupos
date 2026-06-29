"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const cardY = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={sectionRef} className="relative py-24 px-6 overflow-hidden">

      <motion.div
        style={{ y: cardY, opacity: cardOpacity }}
        className="relative mx-auto max-w-3xl"
      >
        <div className="terminal-window relative">
          <div className="terminal-window-titlebar">
            <div className="flex items-center gap-1.5">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
            </div>
            <span className="font-mono text-xs text-muted-foreground ml-3">
              startupos/install.sh
            </span>
          </div>

          <div className="p-8 sm:p-10 text-center">
            <div className="inline-flex items-center gap-2 rounded border border-primary/15 bg-primary/5 px-3 py-1 font-mono text-[10px] text-primary mb-6">
              <Terminal className="h-3 w-3" />
              <span>$ ./startupos --install --no-vc-required</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Compile Your{" "}
              <span className="text-primary crt-glow">
                Startup OS
              </span>
            </h2>

            <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto font-mono">
              Stop juggling 47 browser tabs. One terminal. Your whole startup.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="font-mono text-sm border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary card-lift"
                asChild
              >
                <Link href="/interview">
                  <Terminal className="h-4 w-4" />
                  ./start --free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <p className="mt-6 font-mono text-[11px] text-muted-foreground/60">
              <span className="text-primary/60">$</span> Free tier. Full workspace. No credit card. No BS.
            </p>

            {/* Founder note — authenticity */}
            <p className="mt-4 font-mono text-[10px] text-muted-foreground/25 italic">
              "I built this because I was tired of watching founders drown in Notion docs." — a founder
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3 font-mono text-[10px] text-muted-foreground/30">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse-subtle" />
            Mission Control
          </span>
          <span>|</span>
          <span>powered by AI</span>
        </div>
      </motion.div>
    </section>
  );
}
