"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";
import { Menu, X, Sparkles, LayoutDashboard, LogOut } from "lucide-react";
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "glass-strong shadow-lg shadow-primary/5"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Image
                src="/logo-full.png"
                alt="StartupOS"
                width={1536}
                height={1024}
                className="h-7 w-auto"
                priority
              />
            </motion.div>
          </Link>
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
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
                className="group relative text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
                {/* Underline slide-in */}
                <motion.span
                  className="absolute -bottom-0.5 left-0 h-px bg-primary"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </a>
            </motion.div>
          ))}
        </nav>

        {/* Desktop CTA */}
        <motion.div
          className="hidden md:flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/blueprints">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    My Blueprints
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => { await signOut(); }}
                  className="gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/sign-in">Sign In</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="sm" className="glow-purple group relative overflow-hidden" asChild>
                  <Link href="/interview">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </motion.span>
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/10 to-purple-400/0"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </Link>
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden relative z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-glass-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden glass-strong border-t border-glass-border overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-6 py-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  custom={i}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex gap-3 pt-2 border-t border-glass-border mt-2"
              >
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1" asChild>
                      <Link href="/blueprints" onClick={() => setMobileOpen(false)}>
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        My Blueprints
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" onClick={async () => { await signOut(); setMobileOpen(false); }}>
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1" asChild>
                      <Link href="/auth/sign-in" onClick={() => setMobileOpen(false)}>Sign In</Link>
                    </Button>
                    <Button size="sm" className="flex-1 glow-purple" asChild>
                      <Link href="/interview" onClick={() => setMobileOpen(false)}>
                        Get Started
                        <Sparkles className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
