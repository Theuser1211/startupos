"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, X, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { useRazorpayCheckout } from "@/lib/startup/subscription-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const plans = [
  {
    name: "Free",
    id: "free" as const,
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for validating your startup idea",
    features: [
      { text: "3 blueprint generations", included: true },
      { text: "Basic founder interview", included: true },
      { text: "1 logo concept", included: true },
      { text: "Verdict & roast analysis", included: true },
      { text: "Website generation", included: false },
      { text: "Priority support", included: false },
      { text: "Custom domains", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Starter",
    id: "starter" as const,
    price: { monthly: 999, yearly: 832 },
    description: "For founders ready to go deeper",
    features: [
      { text: "20 blueprint generations", included: true },
      { text: "Full AI-powered analysis", included: true },
      { text: "10 logo concepts", included: true },
      { text: "1 website generation", included: true },
      { text: "ICP & revenue analysis", included: true },
      { text: "Email support", included: true },
      { text: "Custom domains", included: false },
    ],
    cta: "Subscribe",
    popular: true,
  },
  {
    name: "Pro",
    id: "pro" as const,
    price: { monthly: 2999, yearly: 2499 },
    description: "For serious founders building in public",
    features: [
      { text: "Unlimited blueprint generations", included: true },
      { text: "Priority AI processing", included: true },
      { text: "Unlimited logo concepts", included: true },
      { text: "20 website generations", included: true },
      { text: "All analysis types unlimited", included: true },
      { text: "Priority support (24h response)", included: true },
      { text: "Custom domains & deployment", included: true },
    ],
    cta: "Subscribe",
    popular: false,
  },
];

export default function PricingPage() {
  const [interval, setInterval_] = useState<"monthly" | "yearly">("monthly");
  const { user } = useAuth();
  const router = useRouter();
  const { initiateCheckout, isLoading, error } = useRazorpayCheckout();
  const { toast } = useToast();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push(`/auth/sign-in?redirect=/pricing`);
      return;
    }

    if (planId === "free") {
      router.push("/interview");
      return;
    }

    try {
      await initiateCheckout(planId as "starter" | "pro", interval);
    } catch {
      toast({ title: "Checkout failed", message: "Please try again.", variant: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold">
              Startup<span className="text-primary">OS</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            {user ? (
              <Link href="/blueprints">
                <Button size="sm" variant="outline" className="text-xs">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/sign-in">
                <Button size="sm" className="text-xs">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-display font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>

          {/* Interval toggle */}
          <div className="inline-flex items-center gap-3 mt-8 p-1 rounded-xl bg-white/5 border border-glass-border">
            <button
              onClick={() => setInterval_("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                interval === "monthly"
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval_("yearly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                interval === "yearly"
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-[10px] opacity-80">-17%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const price = interval === "monthly" ? plan.price.monthly : plan.price.yearly;
            const displayPrice = plan.id === "free" ? "0" : (price / 100).toLocaleString("en-IN");

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card
                  className={`relative h-full transition-all duration-300 hover:shadow-lg ${
                    plan.popular
                      ? "border-primary/30 ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                      : "hover:border-primary/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-white px-4 py-1 text-xs font-semibold">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8">
                    <h2 className="text-lg font-semibold mb-1">{plan.name}</h2>
                    <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-3xl font-bold">
                        {plan.id === "free" ? "₹0" : `₹${displayPrice}`}
                      </span>
                      {plan.id !== "free" && (
                        <span className="text-sm text-muted-foreground ml-1">/{interval === "monthly" ? "mo" : "yr"}</span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading}
                      variant={plan.popular ? "default" : "outline"}
                      className={`w-full mb-6 gap-1.5 ${
                        plan.popular ? "bg-gradient-to-r from-primary to-secondary" : ""
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : plan.id === "free" ? (
                        "Get Started"
                      ) : (
                        "Subscribe"
                      )}
                    </Button>

                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className="flex items-start gap-2.5">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          )}
                          <span className={`text-xs ${feature.included ? "" : "text-muted-foreground"}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-red-400 mt-6"
          >
            {error}
          </motion.p>
        )}

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <h2 className="text-xl font-semibold mb-6">Frequently asked questions</h2>
          <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto text-left">
            {[
              { q: "Can I switch plans anytime?", a: "Yes. Upgrade or downgrade at any time. Changes take effect on your next billing cycle." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, UPI, and net banking through Razorpay." },
              { q: "Can I cancel my subscription?", a: "Yes, cancel anytime. Your access continues until the end of the current billing period." },
              { q: "What happens to my data if I downgrade?", a: "Your blueprints and data are preserved. You'll only lose access to premium features." },
            ].map((faq) => (
              <div key={faq.q} className="p-4 rounded-xl bg-white/5 border border-glass-border">
                <h3 className="text-sm font-semibold mb-1">{faq.q}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
