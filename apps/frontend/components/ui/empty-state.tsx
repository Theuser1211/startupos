"use client";

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
  actionLabel,
  actionHref,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded border border-border bg-accent">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>

      <h3 className="text-xl font-sans font-semibold text-foreground mb-2">
        {title}
      </h3>

      <p className="text-sm font-mono text-muted-foreground max-w-md leading-relaxed mb-8">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {actionLabel && actionHref && (
          <Button asChild>
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
      </div>
    </div>
  );
}
