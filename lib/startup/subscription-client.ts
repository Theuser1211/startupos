"use client";

import { useState, useCallback } from "react";
import type { Subscription, SubscriptionPlan } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface CheckoutResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Initiate a Razorpay checkout for a subscription plan.
 * Loads the Razorpay SDK, creates an order via the API, and opens the checkout.
 */
export function useRazorpayCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCheckout = useCallback(
    async (plan: SubscriptionPlan, interval: "monthly" | "yearly") => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Create order on the server
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, interval }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create checkout");
        }

        const order: CheckoutResponse = await res.json();

        // 2. Load Razorpay SDK if not already loaded
        if (!window.Razorpay) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
            document.body.appendChild(script);
          });
        }

        // 3. Open Razorpay checkout
        const razorpay = new window.Razorpay!({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: "StartupOS",
          description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — ${interval}`,
          image: "/icon.svg",
          theme: {
            color: "#7C3AED",
          },
          handler: async (response: RazorpayResponse) => {
            // 4. Verify payment on the server
            try {
              const verifyRes = await fetch("/api/subscriptions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  plan,
                  interval,
                }),
              });

              if (!verifyRes.ok) {
                const data = await verifyRes.json();
                setError(data.error || "Payment verification failed");
              }
            } catch {
              setError("Payment verification failed. Please contact support.");
            }
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
            },
          },
        });

        razorpay.open();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Checkout failed");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { initiateCheckout, isLoading, error };
}
