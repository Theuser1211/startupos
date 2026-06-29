"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { type LucideIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  gradient = "from-primary to-secondary",
  actionLabel,
  actionHref,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-accent relative"
      >
        <Icon className="h-6 w-6 text-muted-foreground" />
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary/40 animate-pulse-subtle" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="text-xl font-sans font-semibold text-foreground mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.2 }}
        className="text-sm font-mono text-muted-foreground max-w-md leading-relaxed mb-8"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        {actionLabel && actionHref && (
          <Button asChild className="card-lift">
            <Link href={actionHref}>
              <ArrowRight className="h-4 w-4" />
              {actionLabel}
            </Link>
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </motion.div>

      {/* Terminal-style hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-8 font-mono text-[10px] text-muted-foreground/20"
      >
        $ echo "the best time to start was yesterday. the second best time is now."
      </motion.p>
    </motion.div>
  );
}
