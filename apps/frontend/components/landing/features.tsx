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
    description: "Talk through your idea with an AI that actually understands startups. Not a chatbot. A sparring partner.",
  },
  {
    icon: Target,
    title: "ICP Builder",
    description: "Figure out who your customer actually is. Not who you think they are. There's a difference.",
  },
  {
    icon: Rocket,
    title: "Smart Roadmap",
    description: "A roadmap that updates itself. Because the one you made in Notion three months ago is already wrong.",
  },
  {
    icon: BarChart3,
    title: "Revenue Modeling",
    description: "Unit economics that make sense. Scenario planning without the spreadsheet headaches.",
  },
  {
    icon: Lightbulb,
    title: "Brand Strategy",
    description: "Brand guidelines generated from your actual positioning. Not generic 'be authentic' advice.",
  },
  {
    icon: Shield,
    title: "Startup Roast",
    description: "Brutally honest feedback. The kind your mom won't give you. Your startup needs this.",
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
    <section id="features" ref={sectionRef} className="relative py-24 px-6 overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ opacity: bgOpacity }}
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 font-mono text-xs text-primary/60 mb-3">
            <Terminal className="h-3.5 w-3.5" />
            <span>$ ls features/</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
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
            className="mt-3 text-sm text-muted-foreground max-w-2xl font-mono"
          >
            Every tool you need to build a real company — no MBA required, no VC pitch needed.
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
                  <div className="terminal-window h-full group transition-all duration-300 hover:border-primary/25">
                    <div className="p-4 h-full flex flex-col">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-mono text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {feature.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-mono flex-1">
                        {feature.description}
                      </p>
                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted-foreground/60">
                          $ {" "}{feature.title.toLowerCase().replace(/\s+/g, "-")} --help
                        </span>
                        <span className="text-primary/50 text-[10px] font-mono">
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
            <span>6 modules loaded. 0 excuses remaining.</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
