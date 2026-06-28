"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Mail, MessageSquare, Globe, AtSign, ExternalLink } from "lucide-react";
import Link from "next/link";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "We typically respond within 24 hours",
    action: "support@startupos.ai",
    href: "mailto:support@startupos.ai",
  },
  {
    icon: MessageSquare,
    title: "Support",
    description: "Get help with your account or features",
    action: "Visit Help Center",
    href: "#",
  },
  {
    icon: Globe,
    title: "Twitter / X",
    description: "Follow us for updates and tips",
    action: "@startupos_ai",
    href: "#",
  },
  {
    icon: AtSign,
    title: "GitHub",
    description: "Report issues and contribute",
    action: "startupos",
    href: "#",
  },
];

export default function ContactPage() {
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
                Get in Touch
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">We&apos;d Love to Hear From You</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Have feedback, running into issues, or want to share what you&apos;re building? Reach out — we read every message.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {contactMethods.map((method, i) => (
                <motion.a
                  key={method.title}
                  href={method.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border bg-card p-8 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{method.title}</h3>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary group-hover:gap-3 transition-all">
                    {method.action}
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-border bg-card p-8 text-center"
            >
              <h2 className="text-xl font-semibold mb-2">Building something amazing?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We&apos;d love to feature your startup. Share your story and you might end up on our homepage.
              </p>
              <Link
                href="/interview"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary transition-colors"
              >
                Start Building Free
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
