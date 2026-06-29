"use client";

import { useState, useEffect } from "react";
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
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="ascii-divider mb-6">
          <span>EOF — thanks for scrolling this far</span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-primary/40">$ startupos --version</span>
            <Image
              src="/logo-full.png"
              alt="StartupOS"
              width={1536}
              height={1024}
              className="h-5 w-auto"
            />
          </Link>

          <nav className="flex items-center gap-4">
            {footerLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                ./{link.label.toLowerCase()}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-subtle" />
            <span className="font-mono text-[10px] text-muted-foreground/50">live</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] text-muted-foreground/50">
            &copy; {year} StartupOS. Ship fast, stay technical.
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/30 italic">
            built with late nights, terminal green, and an unreasonable amount of coffee
          </p>
        </div>
      </div>
    </footer>
  );
}
