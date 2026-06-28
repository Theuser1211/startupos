"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export interface Stage {
  label: string;
  description?: string;
}

export function StagedProgress({
  stages,
  currentStage,
  progress,
}: {
  stages: Stage[];
  currentStage: number;
  progress: number;
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-primary to-primary/60 -translate-y-1/2 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, (currentStage / (stages.length - 1)) * 100)}%` }}
        />
        <div className="relative flex justify-between">
          {stages.map((stage, i) => {
            const isCompleted = i < currentStage;
            const isCurrent = i === currentStage;
            return (
              <div key={i} className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                    backgroundColor: isCompleted || isCurrent ? "rgb(34, 197, 94)" : "rgba(255,255,255,0.05)",
                    borderColor: isCompleted || isCurrent ? "rgb(34, 197, 94)" : "rgba(255,255,255,0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-mono"
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Check className="h-4 w-4 text-white" />
                    </motion.div>
                  ) : (
                    <span className={isCurrent ? "text-white" : "text-white/30"}>{i + 1}</span>
                  )}
                </motion.div>
                <span
                  className={`mt-2 text-[10px] font-mono text-center leading-tight max-w-16 ${
                    isCompleted ? "text-primary" : isCurrent ? "text-white/80" : "text-white/30"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-sm font-mono text-white/90 mb-1">
            {stages[currentStage]?.label}
          </p>
          {stages[currentStage]?.description && (
            <p className="text-xs text-muted-foreground">{stages[currentStage].description}</p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">{Math.round(progress)}%</p>
    </div>
  );
}
