"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb } from "lucide-react";
import type { DashboardData } from "@startupos/shared";

interface RiskFactor {
  label: string;
  contribution: number;
  icon: string;
}

interface RiskResult {
  risk: number;
  label: string;
  color: string;
  borderColor: string;
  factors: RiskFactor[];
  recommendations: string[];
  barColor: string;
}

const industryRisk: Record<string, number> = {
  ecommerce: 10, hardware: 15, gaming: 8, services: 12,
  marketplace: 18, social: 20, entertainment: 12,
  travel: 16, food: 14,
};

function computeRisk(dashboard: DashboardData): RiskResult {
  const { healthScore, healthBreakdown, recentEvents, startup } = dashboard;
  const factors: RiskFactor[] = [];
  const industry = startup.industry?.toLowerCase() || "";

  const healthFactor = 100 - healthScore;
  if (healthFactor > 20) {
    factors.push({ label: "Low overall health score", contribution: Math.round(healthFactor * 0.3), icon: "" });
  }
  const foundational = 100 - (healthBreakdown.foundational / 25) * 100;
  if (foundational > 30) {
    factors.push({ label: "Weak startup foundation", contribution: Math.round(foundational * 0.2), icon: "" });
  }
  const product = 100 - (healthBreakdown.product / 25) * 100;
  if (product > 30) {
    factors.push({ label: "No product or website ready", contribution: Math.round(product * 0.15), icon: "" });
  }
  const launch = 100 - (healthBreakdown.launch / 25) * 100;
  if (launch > 30) {
    factors.push({ label: "Hasn't launched yet", contribution: Math.round(launch * 0.15), icon: "" });
  }
  const engagement = 100 - (healthBreakdown.engagement / 25) * 100;
  if (engagement > 30) {
    factors.push({ label: "Low user engagement", contribution: Math.round(engagement * 0.1), icon: "" });
  }
  if (recentEvents.length < 3) {
    factors.push({ label: "No recent activity", contribution: 10, icon: "" });
  }
  const matchedIndustry = Object.entries(industryRisk).find(([key]) =>
    industry.includes(key)
  );
  if (matchedIndustry) {
    factors.push({ label: `High-risk industry (${startup.industry})`, contribution: matchedIndustry[1], icon: "" });
  }

  let rawRisk = 0;
  rawRisk += healthFactor * 0.3;
  rawRisk += foundational * 0.2;
  rawRisk += product * 0.15;
  rawRisk += launch * 0.15;
  rawRisk += engagement * 0.1;
  rawRisk += recentEvents.length < 3 ? 10 : recentEvents.length < 8 ? 5 : 0;
  if (matchedIndustry) rawRisk += matchedIndustry[1] * 0.1;

  const risk = Math.min(99, Math.max(1, Math.round(rawRisk)));

  let label: string, color: string, borderColor: string, barColor: string;
  if (risk <= 25) {
    label = "Low Risk";
    color = "text-success";
    borderColor = "border-success/20";
    barColor = "bg-success";
  } else if (risk <= 50) {
    label = "Moderate Risk";
    color = "text-warning";
    borderColor = "border-warning/20";
    barColor = "bg-warning";
  } else if (risk <= 75) {
    label = "High Risk";
    color = "text-orange-400";
    borderColor = "border-orange-400/20";
    barColor = "bg-orange-400";
  } else {
    label = "Critical Risk";
    color = "text-destructive";
    borderColor = "border-destructive/20";
    barColor = "bg-destructive";
  }

  const recommendations: string[] = [];
  if (healthBreakdown.foundational < 15) recommendations.push("Complete the founder interview and generate a blueprint");
  if (healthBreakdown.product < 15) recommendations.push("Build and deploy a website to validate your idea");
  if (healthBreakdown.launch < 15) recommendations.push("Focus on launching a minimum viable product");
  if (healthBreakdown.engagement < 15) recommendations.push("Increase engagement through updates and outreach");
  if (recentEvents.length < 3) recommendations.push("Ship something this week. Momentum matters more than perfection");

  return { risk, label, color, borderColor, factors, recommendations, barColor };
}

function asciiBar(value: number, max: number, length = 10): string {
  const filled = Math.round((value / max) * length);
  return "\u2588".repeat(filled) + "\u2591".repeat(length - filled);
}

interface DeathPredictorProps {
  dashboard: DashboardData;
}

export function DeathPredictor({ dashboard }: DeathPredictorProps) {
  const result = useMemo(() => computeRisk(dashboard), [dashboard]);

  return (
    <div className="terminal-panel h-full font-mono text-sm glow-red">
      <div className="terminal-panel-header">
        <span className="w-2 h-2 rounded-full bg-destructive/60 animate-pulse-subtle" />
        <span className="tracking-wide text-destructive">startup risk --assess</span>
      </div>

      <div className="terminal-panel-body space-y-4">

        <div className="flex items-center gap-4">
        <motion.div
          className={`flex h-16 w-16 items-center justify-center rounded-lg border ${result.borderColor} ${result.color.replace("text-", "bg-").replace("success", "success/10").replace("warning", "warning/10").replace("destructive", "destructive/10").replace("orange-400", "orange-400/10")}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <motion.span
            className={`text-xl font-bold ${result.color}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {result.risk}%
          </motion.span>
        </motion.div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`terminal-badge ${result.color}`}>{result.label}</span>
            {result.risk > 50 && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {result.risk <= 25
              ? "Solid. Keep shipping."
              : result.risk <= 50
                ? "Some areas need attention."
                : result.risk <= 75
                  ? "Significant risk. Time to act."
                  : "Critical. Focus on survival."}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Failure probability</span>
          <span className={result.color}>{result.risk}%</span>
        </div>
        <motion.div
          className="h-1.5 rounded-full bg-border overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className={`h-full rounded-full ${result.barColor}`}
            initial={{ width: "0%" }}
            animate={{ width: `${result.risk}%` }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          />
        </motion.div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">risk factors</p>
        {result.factors.length > 0 ? (
          <div className="space-y-1.5">
            {result.factors.slice(0, 4).map((factor, i) => (
              <motion.div
                key={factor.label}
                className="flex items-center justify-between rounded-md border border-primary/5 bg-surface px-3 py-1.5 terminal-row"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                 <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{factor.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] tracking-wider ${result.color}`}>
                    {asciiBar(100 - factor.contribution, 100, 6)}
                  </span>
                  <span className={`text-xs font-mono ${result.color}`}>-{factor.contribution}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-2">No significant risk factors detected.</p>
        )}
      </div>

      {result.recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">recommendations</p>
          <div className="space-y-1.5">
            {result.recommendations.slice(0, 3).map((rec, i) => (
              <motion.div
                key={rec}
                className="flex items-start gap-2 rounded-md border border-primary/5 bg-surface px-3 py-1.5 terminal-row"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
              >
                <Lightbulb className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">{rec}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
