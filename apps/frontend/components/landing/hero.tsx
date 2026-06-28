"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stickers = [
  { text: "Founder Tested" },
  { text: "Ship Fast" },
  { text: "Beta" },
];

const terminalLines = [
  { text: "Initializing founder environment...", delay: 0.8 },
  { text: "Loading AI startup kernel...", delay: 1.2 },
  { text: "✓ System ready", delay: 1.6 },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      <motion.div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[120px]" />
      </motion.div>

      <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />

      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-20 mx-auto max-w-6xl px-6 w-full"
      >
        <div className="terminal-window scanlines relative">
          <div className="terminal-window-titlebar">
            <div className="flex items-center gap-1.5">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
            </div>
            <span className="font-mono text-xs text-muted-foreground ml-3">
              startupos/configure.sh — zsh
            </span>
          </div>

          <div className="p-8 sm:p-12 md:p-16">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-3xl"
            >
              <motion.div variants={itemVariants} className="mb-4">
                <div className="flex items-center gap-2 font-mono text-sm text-primary/60">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>$ ./configure --founder-mode --os=startupos</span>
                  <span className="w-2 h-4 bg-primary/60 animate-terminal-blink" />
                </div>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-none tracking-tight mt-6"
              >
                <span className="text-foreground">Build Your</span>
                <br />
                <span className="text-primary">
                  Startup OS
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed font-mono text-sm sm:text-base"
              >
                The operating system for modern founders. Clarify your vision, align your team,
                and execute with precision — all powered by AI that understands your startup.
              </motion.p>

              <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-start gap-4">
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
              </motion.div>

              <motion.div variants={itemVariants} className="mt-16 flex flex-wrap gap-3">
                {stickers.map((s) => (
                  <span key={s.text} className="sticker-badge">
                    ◆ {s.text}
                  </span>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8 space-y-1 font-mono text-xs text-muted-foreground/40">
                {terminalLines.map((line) => (
                  <motion.p
                    key={line.text}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: line.delay, duration: 0.5 }}
                  >
                    {line.text.startsWith("✓") ? (
                      <span className="text-primary">{line.text}</span>
                    ) : (
                      line.text
                    )}
                  </motion.p>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 font-mono text-xs text-muted-foreground/40">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-subtle" />
            system online
          </span>
          <span className="text-muted-foreground/20">|</span>
          <span>From idea to blueprint in minutes — no MBA required</span>
        </div>
      </motion.div>

      <div aria-hidden="true" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs font-mono">scroll</span>
            <div className="h-8 w-5 rounded-full border border-glass-border flex justify-center p-1">
              <motion.div
                className="h-2 w-1 rounded-full bg-primary/60"
                animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
