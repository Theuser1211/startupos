"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "Features", href: "#features" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

const emojiBadges = ["🚀", "⚡", "🛠️", "🔥", "💡"];

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="relative border-t border-glass-border py-12 px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="ascii-divider mb-8">
          <span>EOF</span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex items-center gap-2"
              >
                <span className="font-mono text-[10px] text-primary/40">$ startupos --version</span>
                <Image
                  src="/logo-full.png"
                  alt="StartupOS"
                  width={1536}
                  height={1024}
                  className="h-5 w-auto"
                />
              </motion.div>
            </Link>
          </motion.div>

          <nav className="flex items-center gap-6">
            {footerLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
              >
                <Link
                  href={link.href}
                  className="group relative font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  ./{link.label.toLowerCase()}
                  <motion.span
                    className="absolute -bottom-0.5 left-0 h-px bg-primary"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-subtle" />
              <span className="font-mono text-[10px] text-muted-foreground/50">live</span>
            </div>
            <div className="flex items-center gap-1.5">
              {emojiBadges.map((emoji, i) => (
                <motion.span
                  key={emoji}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="text-xs hover:scale-110 transition-transform cursor-default"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 pt-6 border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="font-mono text-[10px] text-muted-foreground/30">
            &copy; {new Date().getFullYear()} StartupOS. All rights reserved.
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/20">
            built with late nights and terminal
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
