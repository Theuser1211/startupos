"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

/* ─── Floating Orb ─── */
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[80px] ${className}`}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        scale: [1, 1.1, 1],
        opacity: [0.4, 0.7, 0.4],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const cardY = useTransform(scrollYProgress, [0, 0.5], [80, 0]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      {/* Background glow */}
      <div aria-hidden="true">
        <FloatingOrb className="top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/10" delay={0} />
        <FloatingOrb className="top-2/3 right-1/4 w-[350px] h-[350px] bg-secondary/10" delay={2} />
        <FloatingOrb className="top-1/2 left-1/2 w-[300px] h-[300px] bg-primary/5" delay={4} />
      </div>

      <motion.div
        style={{ y: cardY, opacity: cardOpacity }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <motion.div
          whileHover={{ borderColor: "rgba(168, 85, 247, 0.3)" }}
          className="relative overflow-hidden rounded-3xl border border-glass-border bg-gradient-to-b from-glass-bg to-primary/5 p-12 sm:p-16 transition-colors duration-500"
        >
          {/* Decorative corner glows */}
          <motion.div
            aria-hidden="true"
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 bg-primary/10"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 bg-secondary/10"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Shimmer border highlight */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, transparent 40%, rgba(120,120,160,0.08) 50%, transparent 60%)",
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6"
            >
              <motion.span
                animate={{ rotate: [0, 15, 0, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </motion.span>
              <span>Start Free — No Credit Card</span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
              Ready to Build Your{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shift">
                Startup OS
              </span>
              ?
            </h2>

            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Clarify your vision, align your team, and move faster —
              all powered by AI that understands your startup.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="xl"
                  className="glow-purple w-full sm:w-auto text-base group relative overflow-hidden"
                  asChild
                >
                  <Link href="/interview">
                    <span className="relative z-10 flex items-center gap-2">
                      Start Building Free
                      <motion.span
                        className="inline-flex"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="h-4 w-4" />
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

            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 text-xs text-muted-foreground"
            >
              Free tier includes full workspace access. No credit card required.
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
