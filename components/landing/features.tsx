"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Brain, Target, Rocket, BarChart3, Lightbulb, Shield, LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI Founder Coach",
    description: "Get personalized insights and strategic advice from an AI that understands your specific startup context, stage, and goals.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Target,
    title: "ICP Builder",
    description: "Define and refine your Ideal Customer Profile with AI-driven market analysis and persona development tools.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Rocket,
    title: "Smart Roadmap",
    description: "Generate dynamic product roadmaps that adapt to your progress, market changes, and user feedback in real-time.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: BarChart3,
    title: "Revenue Modeling",
    description: "Build sophisticated financial models with AI-powered projections, scenario planning, and unit economics analysis.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Lightbulb,
    title: "Brand Strategy",
    description: "Develop a cohesive brand identity with AI-generated guidelines, messaging frameworks, and visual direction.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Shield,
    title: "Startup Roast",
    description: "Get brutally honest feedback on your startup from AI that identifies blind spots, risks, and growth opportunities.",
    gradient: "from-primary to-secondary",
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
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function AnimatedBadge({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6"
    >
      <motion.span
        animate={{ rotate: [0, 10, 0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        ◆
      </motion.span>
      {text}
    </motion.div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  return (
    <section id="features" ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
        style={{ opacity: bgOpacity, scale: bgScale }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px]"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-secondary/5 blur-[80px]"
        animate={{ scale: [1.2, 1, 1.2], rotate: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <AnimatedBadge text="Everything you need" />
          <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            The Complete{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shift">
              Founder Toolkit
            </span>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-muted-foreground max-w-2xl mx-auto"
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
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={itemVariants} className="group">
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-full"
                >
                  <Card className="group h-full border-glass-border transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-purple-500/10 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "200%" }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                    <CardHeader>
                      <motion.div
                        className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg relative overflow-hidden`}
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 0, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 rounded-xl"
                        />
                        <Icon className="h-5 w-5 text-white relative z-10" />
                      </motion.div>
                      <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
