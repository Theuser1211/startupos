"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";
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
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-accent"
      >
        <Icon className="h-6 w-6 text-muted-foreground" />
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
          <Button asChild>
            <Link href={actionHref}>
              {">"}
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
    </motion.div>
  );
}
