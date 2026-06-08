"use client";

import { motion } from "framer-motion";
import { Sparkles, Mail, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";

const contactMethods = [
  { icon: Mail, title: "Email", desc: "support@startupos.app", link: "mailto:support@startupos.app" },
  { icon: MessageSquare, title: "Feedback", desc: "Send feature requests or feedback", link: "mailto:feedback@startupos.app" },
  { icon: ExternalLink, title: "GitHub", desc: "Report issues or contribute", link: "https://github.com/startupos" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold">
              Startup<span className="text-primary">OS</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-3">Contact Us</h1>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Have a question, feature request, or just want to say hi? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-12">
            {contactMethods.map((method) => (
              <motion.a
                key={method.title}
                href={method.link}
                target={method.link.startsWith("http") ? "_blank" : undefined}
                rel={method.link.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="group rounded-2xl border border-glass-border bg-glass-bg p-5 text-center hover:border-primary/30 transition-all duration-300"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <method.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{method.title}</h3>
                <p className="text-xs text-muted-foreground">{method.desc}</p>
              </motion.a>
            ))}
          </div>

          <div className="rounded-2xl border border-glass-border bg-glass-bg p-8 text-center">
            <h2 className="text-base font-semibold mb-2">Response Time</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We typically respond within 24 hours during business days. For urgent issues,
              please use the email subject line <span className="text-foreground font-mono text-xs">[URGENT]</span>.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
