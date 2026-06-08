"use client";

import { motion } from "framer-motion";
import { Sparkles, Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Privacy Policy</h1>
              <p className="text-xs text-muted-foreground">Last updated: June 2025</p>
            </div>
          </div>

          <div className="max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p>
                We collect information you provide when creating an account, completing the founder interview,
                and using the StartupOS platform. This includes your name, email address, startup idea details,
                and any content you generate through our services.
              </p>
              <p className="mt-2">
                We automatically collect certain technical information when you use the platform, including
                IP address, browser type, device information, and usage patterns to improve our service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <p>We use the collected information to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provide, maintain, and improve the StartupOS platform</li>
                <li>Generate startup blueprints, analyses, and other AI-powered content</li>
                <li>Communicate with you about your account and service updates</li>
                <li>Detect, prevent, and address technical issues or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. Data Storage and Security</h2>
              <p>
                Your data is stored securely using Supabase, a SOC 2 compliant database provider.
                We implement industry-standard security measures including encryption at rest and in transit,
                regular security audits, and access controls.
              </p>
              <p className="mt-2">
                AI-generated content is processed through OpenRouter, which uses third-party AI models.
                These providers do not train on your data unless explicitly enabled. See OpenRouter&apos;s
                privacy policy for details.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Sharing</h2>
              <p>
                We do not sell your personal information. We may share data with trusted service providers
                (Supabase, Vercel, OpenRouter) who assist in operating the platform. These providers are
                contractually bound to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Access and export your data at any time</li>
                <li>Delete your account and all associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request correction of inaccurate data</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, visit your account settings or contact us at privacy@startupos.app.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. Cookies</h2>
              <p>
                We use essential cookies for authentication and session management. We do not use tracking
                cookies or third-party analytics that require cookie consent. Our analytics (Vercel Analytics)
                are privacy-friendly and do not use cookies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of material changes
                via email or through the platform. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Contact</h2>
              <p>
                For privacy-related inquiries, contact us at privacy@startupos.app or visit our
                contact page.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
