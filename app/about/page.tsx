"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Rocket, Target, Heart } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Rocket, title: "Founders First", desc: "Every feature we build starts with a founder's real problem." },
  { icon: Target, title: "Radical Clarity", desc: "We believe the best startups come from crystal-clear thinking." },
  { icon: Heart, title: "Honest Feedback", desc: "No sugar-coating. Founders deserve brutal honesty, not platitudes." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/">
            <Image
              src="/logo-full.png"
              alt="StartupOS"
              width={1536}
              height={1024}
              className="h-5 w-auto"
            />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-16">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-3">About StartupOS</h1>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              We&apos;re building the operating system for modern founders — a single platform that takes
              you from idea to execution with AI-powered clarity.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Our Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every day, thousands of founders have startup ideas. Most never take the first step because
                the path from idea to execution is overwhelming. We believe that with the right tools,
                clear thinking, and honest feedback, anyone can build a great company.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                StartupOS replaces the scattered toolkit of spreadsheets, notepads, and guesswork with
                a unified platform that analyzes, validates, and accelerates your startup journey.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              {values.map((v) => (
                <div key={v.title} className="rounded-2xl border border-glass-border bg-glass-bg p-5 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{v.title}</h3>
                  <p className="text-xs text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">Why StartupOS?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Because building a startup is hard enough without juggling 15 tools. Because founders
                deserve the same strategic depth as a YC partner, available 24/7. Because the best
                time to start is now — and we want to help you take that first step.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
