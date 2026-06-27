"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Skull, Lightbulb } from "lucide-react";
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
  bgColor: string;
  borderColor: string;
  factors: RiskFactor[];
  recommendations: string[];
}

const industryRisk: Record<string, number> = {
  ecommerce: 10,
  hardware: 15,
  gaming: 8,
  services: 12,
  marketplace: 18,
  social: 20,
  entertainment: 12,
  travel: 16,
  food: 14,
};

function computeRisk(dashboard: DashboardData): RiskResult {
  const { healthScore, healthBreakdown, recentEvents, startup } = dashboard;

  const factors: RiskFactor[] = [];
  const industry = startup.industry?.toLowerCase() || "";

  const healthFactor = 100 - healthScore;
  if (healthFactor > 20) {
    factors.push({ label: "Low overall health score", contribution: Math.round(healthFactor * 0.3), icon: "🩸" });
  }

  const foundational = 100 - (healthBreakdown.foundational / 25) * 100;
  if (foundational > 30) {
    factors.push({ label: "Weak startup foundation", contribution: Math.round(foundational * 0.2), icon: "🏗️" });
  }

  const product = 100 - (healthBreakdown.product / 25) * 100;
  if (product > 30) {
    factors.push({ label: "No product or website ready", contribution: Math.round(product * 0.15), icon: "📦" });
  }

  const launch = 100 - (healthBreakdown.launch / 25) * 100;
  if (launch > 30) {
    factors.push({ label: "Hasn't launched yet", contribution: Math.round(launch * 0.15), icon: "🚀" });
  }

  const engagement = 100 - (healthBreakdown.engagement / 25) * 100;
  if (engagement > 30) {
    factors.push({ label: "Low user engagement", contribution: Math.round(engagement * 0.1), icon: "📊" });
  }

  if (recentEvents.length < 3) {
    factors.push({ label: "No recent activity or milestones", contribution: 10, icon: "💤" });
  }

  const matchedIndustry = Object.entries(industryRisk).find(([key]) =>
    industry.includes(key)
  );
  if (matchedIndustry) {
    factors.push({ label: `High-risk industry (${startup.industry})`, contribution: matchedIndustry[1], icon: "⚠️" });
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

  let label: string, color: string, bgColor: string, borderColor: string;
  if (risk <= 25) {
    label = "Low Risk";
    color = "text-emerald-400";
    bgColor = "bg-emerald-500/10";
    borderColor = "border-emerald-500/20";
  } else if (risk <= 50) {
    label = "Moderate Risk";
    color = "text-amber-400";
    bgColor = "bg-amber-500/10";
    borderColor = "border-amber-500/20";
  } else if (risk <= 75) {
    label = "High Risk";
    color = "text-orange-400";
    bgColor = "bg-orange-500/10";
    borderColor = "border-orange-500/20";
  } else {
    label = "Critical Risk";
    color = "text-red-400";
    bgColor = "bg-red-500/10";
    borderColor = "border-red-500/20";
  }

  const recommendations: string[] = [];
  if (healthBreakdown.foundational < 15) {
    recommendations.push("Complete the founder interview and generate a blueprint");
  }
  if (healthBreakdown.product < 15) {
    recommendations.push("Build and deploy a website to validate your idea");
  }
  if (healthBreakdown.launch < 15) {
    recommendations.push("Focus on launching a minimum viable product");
  }
  if (healthBreakdown.engagement < 15) {
    recommendations.push("Increase user engagement through regular updates and outreach");
  }
  if (recentEvents.length < 3) {
    recommendations.push("Establish a consistent cadence of milestones and shipping");
  }

  return {
    risk,
    label,
    color,
    bgColor,
    borderColor,
    factors,
    recommendations,
  };
}

interface DeathPredictorProps {
  dashboard: DashboardData;
}

export function DeathPredictor({ dashboard }: DeathPredictorProps) {
  const result = useMemo(() => computeRisk(dashboard), [dashboard]);

  return (
    <Card className={`border-glass-border bg-glass-bg h-full`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Skull className="h-4 w-4 text-muted-foreground" />
          Startup Death Predictor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5 mb-5">
          <div className="relative">
            <motion.div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl ${result.bgColor} ${result.borderColor} border`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.span
                className={`text-3xl font-bold font-display ${result.color}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {result.risk}%
              </motion.span>
            </motion.div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-semibold ${result.color}`}>{result.label}</span>
              {result.risk > 50 && (
                <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {result.risk <= 25
                ? "Your startup is on solid ground. Keep shipping."
                : result.risk <= 50
                  ? "Some areas need attention, but you're not in danger yet."
                  : result.risk <= 75
                    ? "Significant risk factors detected. Time to act."
                    : "Critical situation. Focus on survival immediately."}
            </p>
          </div>
        </div>

        <motion.div
          className="h-2 rounded-full bg-glass-bg border border-glass-border overflow-hidden mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className={`h-full rounded-full ${result.risk <= 25 ? "bg-emerald-400" : result.risk <= 50 ? "bg-amber-400" : result.risk <= 75 ? "bg-orange-400" : "bg-red-400"}`}
            initial={{ width: "0%" }}
            animate={{ width: `${result.risk}%` }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          />
        </motion.div>

        {result.factors.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk Factors</p>
            <div className="space-y-1.5">
              {result.factors.slice(0, 4).map((factor, i) => (
                <motion.div
                  key={factor.label}
                  className="flex items-center justify-between rounded-lg px-3 py-2 bg-glass-bg border border-glass-border"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  <span className="flex items-center gap-2 text-xs">
                    <span>{factor.icon}</span>
                    {factor.label}
                  </span>
                  <span className={`text-xs font-mono ${result.color}`}>-{factor.contribution}%</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {result.recommendations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommendations</p>
            <div className="space-y-1.5">
              {result.recommendations.slice(0, 3).map((rec, i) => (
                <motion.div
                  key={rec}
                  className="flex items-start gap-2 rounded-lg px-3 py-2 bg-glass-bg border border-glass-border"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground">{rec}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {result.factors.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">
            No significant risk factors detected. Your startup is in good shape!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
