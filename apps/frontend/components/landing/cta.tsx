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
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        style={{ y: cardY, opacity: cardOpacity }}
        className="relative mx-auto max-w-4xl"
      >
        <div className="terminal-window scanlines relative">
          <div className="terminal-window-titlebar">
            <div className="flex items-center gap-1.5">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
            </div>
            <span className="font-mono text-xs text-muted-foreground ml-3">
              startupos/install.sh — zsh
            </span>
          </div>

          <div className="p-8 sm:p-12 md:p-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-sm border border-primary/15 bg-primary/5 px-3 py-1 font-mono text-[10px] text-primary mb-8"
            >
              <Terminal className="h-3 w-3" />
              <span>$ ./startupos --install</span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
              Ready to Build Your{" "}
              <span className="text-primary">
                Startup OS
              </span>
              ?
            </h2>

            <p className="mt-4 text-muted-foreground max-w-xl mx-auto font-mono text-sm">
              Clarify your vision, align your team, and move faster —
              all powered by AI that understands your startup.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="xl"
                  className="glow-green-btn font-mono text-sm border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary"
                  asChild
                >
                  <Link href="/interview">
                    <span className="flex items-center gap-2">
                      <Terminal className="h-4 w-4" />
                      ./start --free
                      <motion.span className="inline-flex" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                    </span>
                  </Link>
                </Button>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 font-mono text-xs text-muted-foreground/40"
            >
              <span className="text-primary/60">$</span> Free tier includes full workspace access. No credit card required.
            </motion.p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 font-mono text-[10px] text-muted-foreground/30">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse-subtle" />
            survived pivot #3
          </span>
          <span>|</span>
          <span>backed by caffeine</span>
          <span>|</span>
          <span>powered by AI</span>
        </div>
      </motion.div>
    </section>
  );
}
