"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Brain, Target, Rocket, BarChart3, Lightbulb, Shield, Terminal, LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI Founder Coach",
    description: "Get personalized insights and strategic advice from an AI that understands your specific startup context, stage, and goals.",
  },
  {
    icon: Target,
    title: "ICP Builder",
    description: "Define and refine your Ideal Customer Profile with AI-driven market analysis and persona development tools.",
  },
  {
    icon: Rocket,
    title: "Smart Roadmap",
    description: "Generate dynamic product roadmaps that adapt to your progress, market changes, and user feedback in real-time.",
  },
  {
    icon: BarChart3,
    title: "Revenue Modeling",
    description: "Build sophisticated financial models with AI-powered projections, scenario planning, and unit economics analysis.",
  },
  {
    icon: Lightbulb,
    title: "Brand Strategy",
    description: "Develop a cohesive brand identity with AI-generated guidelines, messaging frameworks, and visual direction.",
  },
  {
    icon: Shield,
    title: "Startup Roast",
    description: "Get brutally honest feedback on your startup from AI that identifies blind spots, risks, and growth opportunities.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 0]);

  return (
    <section id="features" ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
        style={{ opacity: bgOpacity }}
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="flex items-center gap-2 font-mono text-sm text-primary/60 mb-4">
            <Terminal className="h-3.5 w-3.5" />
            <span>$ ls features/</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            The Complete{" "}
            <span className="text-primary">
              Founder Toolkit
            </span>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-muted-foreground max-w-2xl font-mono text-sm"
          >
            From ideation to Series A, StartupOS provides every tool you need to build
            a successful company — no MBA required.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isWide = index === 2;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={isWide ? "lg:col-span-2" : ""}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-full"
                >
                  <div className="terminal-window h-full group transition-all duration-500 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5">
                    <div className="p-5 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-mono text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {feature.title}
                          </h3>
                        </div>
                        <div className="flex gap-1 opacity-30 group-hover:opacity-60 transition-opacity">
                          <div className="w-2 h-2 rounded-full border border-muted-foreground/30" />
                          <div className="w-2 h-2 rounded-full border border-muted-foreground/30" />
                          <div className="w-2 h-2 rounded-full border border-muted-foreground/30" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed font-mono text-xs flex-1">
                        {feature.description}
                      </p>
                      <div className="mt-4 pt-3 border-t border-primary/5 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-primary/40">
                          $ {" "}{feature.title.toLowerCase().replace(/\s+/g, "-")} --help
                        </span>
                        <span className="text-primary/30 text-[10px] font-mono">
                          ✓ online
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-16"
        >
          <div className="ascii-divider">
            <span>6 modules loaded</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
