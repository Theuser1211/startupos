"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ChecklistItem {
  key: string;
  label: string;
  href?: string;
}

const defaultItems: ChecklistItem[] = [
  { key: "interview", label: "Complete Interview", href: "/interview" },
  { key: "blueprint", label: "Generate Blueprint" },
  { key: "website", label: "Generate Website" },
  { key: "deploy", label: "Deploy Website" },
];

function getCompleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("startupos-onboarding");
    const saved: string[] = stored ? JSON.parse(stored) : [];

    const autoDetected: string[] = [];
    if (localStorage.getItem("startupos-founder")) autoDetected.push("interview");
    if (localStorage.getItem("startupos-blueprint-done")) autoDetected.push("blueprint");
    if (localStorage.getItem("startupos-website-done")) autoDetected.push("website");
    if (localStorage.getItem("startupos-deploy-done")) autoDetected.push("deploy");

    const merged = [...new Set([...saved, ...autoDetected])];
    if (merged.length > saved.length) {
      localStorage.setItem("startupos-onboarding", JSON.stringify(merged));
    }
    return merged;
  } catch {
    return [];
  }
}

function saveCompleted(keys: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("startupos-onboarding", JSON.stringify(keys));
}

export function useOnboarding() {
  const [dismissed, setDismissed] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(getCompleted());
    const stored = localStorage.getItem("startupos-onboarding-dismissed");
    if (stored === "true") setDismissed(true);
  }, []);

  const markCompleted = (key: string) => {
    const updated = [...new Set([...completed, key])];
    setCompleted(updated);
    saveCompleted(updated);
  };

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("startupos-onboarding-dismissed", "true");
  };

  const undoneCount = defaultItems.filter((item) => !completed.includes(item.key)).length;

  return { completed, dismissed, undoneCount, markCompleted, dismiss, show: !dismissed && undoneCount > 0 };
}

export function OnboardingChecklist({
  completed,
  onDismiss,
}: {
  completed: string[];
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(true);

  const allDone = defaultItems.every((item) => completed.includes(item.key));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl p-6 relative"
        >
          <button
            onClick={() => { setVisible(false); onDismiss(); }}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss checklist"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">
                {allDone ? "All done! 🎉" : "Getting Started"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {allDone
                  ? "You've completed all the onboarding steps."
                  : `${defaultItems.filter((i) => !completed.includes(i.key)).length} step${defaultItems.filter((i) => !completed.includes(i.key)).length !== 1 ? "s" : ""} remaining`
                }
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {defaultItems.map((item) => {
              const isDone = completed.includes(item.key);
              return (
                <div key={item.key} className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isDone
                        ? "border-emerald-500 bg-emerald-500/20"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    {isDone && <Check className="h-3 w-3 text-emerald-400" />}
                  </div>
                  {item.href && !isDone ? (
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className={`text-xs ${isDone ? "text-white/60 line-through" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {allDone && (
            <Button
              size="sm"
              variant="outline"
              className="mt-4 w-full text-xs"
              onClick={() => { setVisible(false); onDismiss(); }}
            >
              Got it!
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
