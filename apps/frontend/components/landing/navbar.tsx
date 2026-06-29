"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/auth-context";
import { Menu, X, LayoutDashboard, LogOut, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Features", href: "#features" },
];

const navItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.1, duration: 0.4 },
  }),
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
};

export function Navbar() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-card/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <span className="hidden sm:inline font-mono text-[11px] text-primary/50 group-hover:text-primary/70 transition-colors">
              $ startupos ~ %
            </span>
            <Image
              src="/logo-full.png"
              alt="StartupOS"
              width={1536}
              height={1024}
              className="h-6 w-auto"
              priority
            />
          </Link>
        </motion.div>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              custom={i}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <a
                href={link.href}
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                ./{link.label.toLowerCase()}
              </a>
            </motion.div>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="font-mono text-xs h-8" asChild>
                <Link href="/workspace">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  workspace
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => { await signOut(); }}
                className="gap-2 font-mono text-xs h-8"
              >
                <LogOut className="h-3.5 w-3.5" />
                sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="font-mono text-xs h-8" asChild>
                <Link href="/auth/sign-in">sign in</Link>
              </Button>
              <Button
                size="sm"
                className="font-mono text-xs h-8 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary"
                asChild
              >
                <Link href="/interview">
                  <Terminal className="h-3.5 w-3.5" />
                  ./start
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden bg-card border-t border-border overflow-hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link, i) => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                  ./{link.label.toLowerCase()}
                </a>
              ))}
              <div className="flex gap-2 pt-2 border-t border-border mt-2">
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1 font-mono text-xs h-8" asChild>
                      <Link href="/workspace" onClick={() => setMobileOpen(false)}>
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        workspace
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1 font-mono text-xs h-8" onClick={async () => { await signOut(); setMobileOpen(false); }}>
                      <LogOut className="h-3.5 w-3.5" />
                      sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1 font-mono text-xs h-8" asChild>
                      <Link href="/auth/sign-in" onClick={() => setMobileOpen(false)}>sign in</Link>
                    </Button>
                    <Button size="sm" className="flex-1 font-mono text-xs h-8 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary" asChild>
                      <Link href="/interview" onClick={() => setMobileOpen(false)}>
                        <Terminal className="h-3.5 w-3.5" />
                        ./start
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
