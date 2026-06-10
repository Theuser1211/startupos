"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  CreditCard, Check, X, Loader2, ArrowLeft, AlertTriangle,
  Sparkles, Calendar, Shield, Zap, BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/supabase/auth-context";
import type { Subscription, SubscriptionPlan, SubscriptionStatus } from "@/lib/types";

/* ─── Plan details ─── */

interface PlanInfo {
  name: string;
  price: string;
  period: string;
  features: string[];
  limitations: string[];
}

const PLAN_INFO: Record<SubscriptionPlan, PlanInfo> = {
  free: {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "3 blueprint generations",
      "Basic founder interview",
      "1 logo concept",
      "Verdict & roast analysis",
    ],
    limitations: [
      "No website generation",
      "No priority support",
      "No custom domains",
    ],
  },
  starter: {
    name: "Starter",
    price: "₹999",
    period: "/month",
    features: [
      "20 blueprint generations",
      "Full AI-powered analysis",
      "10 logo concepts",
      "1 website generation",
      "ICP & revenue analysis",
      "Email support",
    ],
    limitations: [
      "No custom domains",
    ],
  },
  pro: {
    name: "Pro",
    price: "₹2,999",
    period: "/month",
    features: [
      "Unlimited blueprint generations",
      "Priority AI processing",
      "Unlimited logo concepts",
      "20 website generations",
      "All analysis types unlimited",
      "Priority support (24h response)",
      "Custom domains & deployment",
    ],
    limitations: [],
  },
};

/* ─── Helpers ─── */

function statusBadge(status: SubscriptionStatus) {
  const config: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "outline" }> = {
    active: { label: "Active", variant: "success" },
    trialing: { label: "Trial", variant: "warning" },
    past_due: { label: "Past Due", variant: "destructive" },
    canceled: { label: "Canceled", variant: "outline" },
    incomplete: { label: "Incomplete", variant: "warning" },
    incomplete_expired: { label: "Expired", variant: "destructive" },
  };
  const c = config[status] || { label: status, variant: "outline" as const };
  return <Badge variant={c.variant} className="text-[10px]">{c.label}</Badge>;
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ─── Component ─── */

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) {
        throw new Error("Failed to fetch subscription data");
      }
      const data = await res.json();
      setSubscription(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/auth/sign-in?redirect=/billing");
      return;
    }
    fetchSubscription();
  }, [user, fetchSubscription, router]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const plan = subscription?.plan || "free";
  const planInfo = PLAN_INFO[plan];
  const isPaid = plan !== "free";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/">
            <Image
              src="/logo-full.png"
              alt="StartupOS"
              width={1536}
              height={1024}
              className="h-5 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/settings">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline ml-1.5">Settings</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Billing & Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscription and billing information
          </p>
        </div>

        {/* Error state */}
        {error && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-300 flex-1">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchSubscription}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Plan */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-glass-border bg-glass-bg overflow-hidden"
        >
          {/* Plan Header */}
          <div className="p-6 pb-4 border-b border-glass-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isPaid
                    ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                    : "bg-white/10"
                }`}>
                  <Sparkles className={`h-5 w-5 ${isPaid ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{planInfo.name} Plan</h2>
                    {statusBadge(subscription?.status || "active")}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {planInfo.price}{planInfo.period}
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <Button variant={isPaid ? "outline" : "default"} size="sm" className="gap-1.5">
                  {isPaid ? "Change Plan" : "Upgrade"}
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Plan Details */}
          <div className="p-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Included Features
              </h3>
              <ul className="space-y-2">
                {planInfo.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
                {planInfo.limitations.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <X className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Subscription Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <span>{statusBadge(subscription?.status || "active")}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Period Start
                  </span>
                  <span>{formatDate(subscription?.current_period_start || null)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Period End
                  </span>
                  <span>{formatDate(subscription?.current_period_end || null)}</span>
                </div>
                {subscription?.canceled_at && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Canceled At</span>
                    <span className="text-red-400">{formatDate(subscription.canceled_at)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="capitalize">{subscription?.provider || "StartupOS"}</span>
                </div>
              </div>

              {!isPaid && (
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    You&apos;re currently on the Free plan. Upgrade to unlock website generation,
                    unlimited blueprints, and priority support.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Usage Summary */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Usage & Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Blueprints", free: "3", paid: "Unlimited" },
                  { label: "Logos", free: "1", paid: "Unlimited" },
                  { label: "Websites", free: "0", paid: plan === "pro" ? "20" : "1" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-lg border border-glass-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-lg font-bold">
                      {isPaid ? item.paid : item.free}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isPaid ? `${plan} plan` : "Free plan"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Payment Info */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Payment & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                All payments are processed securely through <strong>Razorpay</strong>, a PCI-DSS compliant
                payment gateway. We never store your full card details on our servers.
              </p>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> PCI-DSS Compliant
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3" /> 256-bit SSL
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Cards, UPI, Net Banking
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Manage Subscription */}
        {isPaid && subscription?.status === "active" && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-3"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-base font-semibold text-amber-400">Cancel Subscription</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your access will continue until the end of the current billing period.
                  After cancellation, you&apos;ll be downgraded to the Free plan.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"                onClick={() => {
                    if (confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.\n\nPlease contact support at support@startupos.app to process the cancellation.")) {
                      alert("To cancel your subscription, please email support@startupos.app. We'll process it within 24 hours.");
                    }
                  }}
            >
              Cancel Subscription
            </Button>
          </motion.section>
        )}
      </main>
    </div>
  );
}
