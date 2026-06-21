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

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="relative border-t border-glass-border py-12 px-6"
    >
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image
                src="/logo-full.png"
                alt="StartupOS"
                width={1536}
                height={1024}
                className="h-6 w-auto"
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
                className="group relative text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
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

        <motion.p
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs text-muted-foreground"
        >
          &copy; {new Date().getFullYear()} StartupOS. All rights reserved.
        </motion.p>
      </div>
    </motion.footer>
  );
}
