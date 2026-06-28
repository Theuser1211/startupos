"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Target, Lightbulb, Shield, Rocket } from "lucide-react";

const values = [
  {
    icon: Lightbulb,
    title: "Founders First",
    description: "Every feature we build starts with a founder's real problem. We ship tools that eliminate busywork so you can focus on product-market fit.",
  },
  {
    icon: Shield,
    title: "Radical Transparency",
    description: "No black-box AI. Every insight, roast, and recommendation comes with reasoning you can challenge, adapt, and own.",
  },
  {
    icon: Rocket,
    title: "Speed as a Feature",
    description: "From idea to blueprint in minutes, not months. We compress the iteration cycle so you fail fast and find product-market fit faster.",
  },
  {
    icon: Target,
    title: "Founder Empathy",
    description: "Built by founders who have been through Y Combinator, raised capital, and launched products. We know the journey because we're living it.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="relative py-24 md:py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 grid-bg" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
                About StartupOS
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Your <span className="text-primary">Co-Founder</span> in Code
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              StartupOS is an AI-powered platform that transforms your startup idea into a comprehensive blueprint,
              brand strategy, and working website — in minutes, not months. We give founders the strategic depth
              of a top-tier VC and the execution speed of a 10-person team.
            </motion.p>
          </div>
        </section>

        <section className="relative py-20 px-6">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold mb-4">What We Believe</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                These principles guide every decision we make and every feature we ship.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-8 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{value.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-20 px-6 border-t border-border">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-4">For Founders, by Founders</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                We started StartupOS because we experienced the pain firsthand — spending weeks on pitch decks,
                market research, and brand strategy instead of building product. We believe founders deserve
                better tools. Tools that think strategically, execute relentlessly, and never sleep.
              </p>
              <Link
                href="/interview"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary transition-colors"
              >
                Start Building Free
                <Rocket className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
