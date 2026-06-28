"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle; border: string; bg: string }> = {
  success: { icon: CheckCircle, border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  error: { icon: AlertCircle, border: "border-red-500/30", bg: "bg-red-500/10" },
  info: { icon: Info, border: "border-blue-500/30", bg: "bg-blue-500/10" },
  warning: { icon: AlertTriangle, border: "border-amber-500/30", bg: "bg-amber-500/10" },
};

const iconColors: Record<ToastVariant, string> = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-blue-400",
  warning: "text-amber-400",
};

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const toast: Toast = { ...t, id };
      setToasts((prev) => [...prev, toast]);
      const duration = t.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast: addToast, dismiss }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const config = variantConfig[t.variant];
            const Icon = config.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "pointer-events-auto relative w-80 rounded-xl border border-primary/10 shadow-xl shadow-black/20",
                  config.border,
                  config.bg,
                  "bg-[#0d0d10]/95",
                )}
                role="alert"
              >
                <div className="flex items-start gap-3 p-4">
                  <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColors[t.variant])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-foreground">{t.title}</p>
                    {t.message && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.message}</p>
                    )}
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="shrink-0 flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
