"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

function Particle({ size, x, y, duration, delay }: {
  size: number; x: number; y: number; duration: number; delay: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute rounded-full bg-primary/15"
      style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
      animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

const PARTICLE_DATA = Array.from({ length: 20 }, () => ({
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 4,
}));

function FloatingOrb({ className, size, delay = 0 }: { className?: string; size: number; delay?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute rounded-full ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [0, -40, 0], x: [0, 20, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 8, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const glowX = useTransform(springX, [0, 1], ["40%", "60%"]);
  const glowY = useTransform(springY, [0, 1], ["35%", "45%"]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <motion.div aria-hidden="true" className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 grid-bg" />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full bg-primary/10 blur-[150px]"
          style={{ left: glowX, top: glowY, x: "-50%", y: "-50%" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px]"
          style={{
            left: useTransform(springX, [0, 1], ["30%", "70%"]),
            top: useTransform(springY, [0, 1], ["60%", "40%"]),
            x: "-50%", y: "-50%",
          }}
        />
        <FloatingOrb size={80} className="bg-primary/5 blur-3xl top-[15%] left-[10%]" delay={0} />
        <FloatingOrb size={120} className="bg-secondary/5 blur-3xl bottom-[25%] right-[15%]" delay={2} />
        <FloatingOrb size={60} className="bg-primary/5 blur-3xl top-[40%] right-[30%]" delay={4} />
      </motion.div>

      {PARTICLE_DATA.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />

      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-20 mx-auto max-w-5xl px-6 text-center"
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="mb-6 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
            >
              <motion.span
                animate={{ rotate: [0, 15, 0, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </motion.span>
              <span>AI-Powered Startup OS — Now in Beta</span>
            </motion.div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-none tracking-tight"
          >
            <span className="text-foreground">Build Your</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shift">
              Startup OS
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            The operating system for modern founders. Clarify your vision, align your team,
            and execute with precision — all powered by AI that understands your startup.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Button size="xl" className="glow-purple w-full sm:w-auto text-base group relative overflow-hidden" asChild>
                <Link href="/interview">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Building Free
                    <motion.span className="inline-flex" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
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
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-16 text-xs text-muted-foreground/60"
          >
            From idea to blueprint in minutes — no MBA required
          </motion.p>
        </motion.div>
      </motion.div>

      <div aria-hidden="true" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs">Scroll to explore</span>
            <div className="h-8 w-5 rounded-full border border-glass-border flex justify-center p-1">
              <motion.div
                className="h-2 w-1 rounded-full bg-primary/60"
                animate={{ y: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
