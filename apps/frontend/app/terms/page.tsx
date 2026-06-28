"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Scale, AlertTriangle, ShieldCheck, UserCheck, Ban } from "lucide-react";

const sections = [
  {
    icon: UserCheck,
    title: "User Responsibilities",
    content: "You are responsible for maintaining the confidentiality of your account credentials. You agree not to use the service for any unlawful purpose or in violation of any applicable laws. You must not attempt to circumvent rate limits, access other users' data, or abuse the AI generation systems.",
  },
  {
    icon: Ban,
    title: "Acceptable Use",
    content: "You may not use StartupOS to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. You may not use the service to create spam, distribute malware, or perform unauthorized security testing. We reserve the right to terminate accounts that violate these terms.",
  },
  {
    icon: AlertTriangle,
    title: "No Warranties",
    content: "StartupOS is provided 'as is' without warranty of any kind, express or implied. We do not guarantee that the AI-generated content (blueprints, brand strategies, websites, competitive analysis) is accurate, complete, or suitable for your specific situation. Generated content should be reviewed by qualified professionals before making business decisions.",
  },
  {
    icon: ShieldCheck,
    title: "Intellectual Property",
    content: "You retain full ownership of your startup data, ideas, and generated content. We claim no intellectual property rights over the materials you create using StartupOS. You are free to use, modify, and distribute the generated content for any purpose, including commercial use.",
  },
  {
    icon: Scale,
    title: "Limitation of Liability",
    content: "StartupOS and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. This includes but is not limited to lost profits, lost opportunities, or business interruption, even if advised of the possibility of such damages.",
  },
];

export default function TermsPage() {
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
                Terms of Service
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
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
              transition={{ delay: 0.6 }}
              className="mt-12 rounded-2xl border border-border bg-card p-8 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Questions about these terms?{" "}
                <a href="mailto:legal@startupos.ai" className="text-primary hover:underline">legal@startupos.ai</a>
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
