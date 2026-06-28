"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Shield, Database, Cookie, Cpu } from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "Information We Collect",
    content: "We collect information you provide directly: your name, email address, and startup details (idea, industry, target customer, business model). We also collect usage data such as page views, feature interactions, and generation timestamps to improve our service.",
  },
  {
    icon: Cookie,
    title: "Cookies",
    content: "We use essential cookies for authentication and session management. We use analytics cookies (via Vercel Analytics) to understand aggregate usage patterns. No third-party tracking cookies are used. You can control cookies through your browser settings.",
  },
  {
    icon: Cpu,
    title: "AI Usage Disclosure",
    content: "StartupOS uses AI models (including GPT, Claude, and open-source models) to generate blueprints, brand strategies, website content, and competitive analysis. Your startup data is sent to these AI providers solely for generation purposes. We do not train AI models on your data. Generated content should be reviewed by a human before use.",
  },
  {
    icon: Shield,
    title: "Data Protection",
    content: "Your data is encrypted in transit (TLS 1.3) and at rest. We use industry-standard security practices including regular audits, access controls, and secure authentication (JWT with refresh tokens). We never sell your data. You can request deletion of your account and associated data at any time by contacting us.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="relative py-24 md:py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 grid-bg" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
                Privacy Policy
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Your Data, Your Control</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">Last updated: June 2026</p>
            </motion.div>

            <div className="space-y-8">
              {sections.map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-8"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 rounded-2xl border border-border bg-card p-8 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Have questions about privacy?{" "}
                <a href="mailto:privacy@startupos.ai" className="text-primary hover:underline">privacy@startupos.ai</a>
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
