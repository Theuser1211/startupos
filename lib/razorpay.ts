/**
 * Razorpay Payment Integration for StartupOS
 *
 * Provides server-side utilities for creating orders, verifying payments,
 * managing subscriptions, and handling webhooks.
 *
 * Docs: https://razorpay.com/docs/api/
 */

import { createHmac } from "crypto";

interface RazorpayOrderParams {
  amount: number; // in paise (Indian currency) or smallest currency unit
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  subscription_id?: string;
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

interface RazorpaySubscriptionParams {
  plan_id: string;
  total_count: number;
  customer_notify?: boolean;
  quantity?: number;
  notes?: Record<string, string>;
}

interface RazorpayPlanParams {
  period: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  item: {
    name: string;
    amount: number; // in paise
    currency: string;
    description?: string;
  };
}

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

function getAuthHeader(): string {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local",
    );
  }

  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${RAZORPAY_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "unknown");
    throw new Error(`Razorpay API error (${response.status}): ${errorBody}`);
  }

  return response.json();
}

/**
 * Create a Razorpay order for one-time payments.
 */
export async function createOrder(
  params: RazorpayOrderParams,
): Promise<RazorpayOrder> {
  return razorpayFetch<RazorpayOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency || "INR",
      receipt: params.receipt,
      notes: params.notes,
    }),
  });
}

/**
 * Verify a Razorpay payment signature (server-side).
 * Should be called after the client completes payment.
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Fetch payment details by ID.
 */
export async function getPayment(paymentId: string): Promise<unknown> {
  return razorpayFetch(`/payments/${paymentId}`);
}

/**
 * Create a subscription plan.
 */
export async function createPlan(
  params: RazorpayPlanParams,
): Promise<{ id: string; [key: string]: unknown }> {
  return razorpayFetch("/plans", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/**
 * Create a subscription.
 */
export async function createSubscription(
  params: RazorpaySubscriptionParams,
): Promise<{ id: string; status: string; [key: string]: unknown }> {
  return razorpayFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/**
 * Cancel a subscription.
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtCycleEnd?: boolean,
): Promise<unknown> {
  const endpoint = cancelAtCycleEnd
    ? `/subscriptions/${subscriptionId}/cancel`
    : `/subscriptions/${subscriptionId}/cancel`;

  return razorpayFetch(endpoint, { method: "POST" });
}

/**
 * Verify webhook signature.
 * Returns true if the signature is valid.
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Plan IDs mapped to StartupOS subscription tiers.
 * These are created via createPlan() and stored in env vars once set up.
 */
export const PLAN_IDS = {
  starter: {
    monthly: process.env.RAZORPAY_STARTER_MONTHLY_PLAN_ID || "",
    yearly: process.env.RAZORPAY_STARTER_YEARLY_PLAN_ID || "",
  },
  pro: {
    monthly: process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID || "",
    yearly: process.env.RAZORPAY_PRO_YEARLY_PLAN_ID || "",
  },
} as const;

/**
 * Price configuration (in INR paise — multiply by 100).
 * These are displayed on the pricing page and used to create orders.
 */
export const PRICES = {
  starter: {
    monthly: 99900, // ₹999/month
    yearly: 999000, // ₹9,990/year (saves ~17%)
  },
  pro: {
    monthly: 299900, // ₹2,999/month
    yearly: 2999000, // ₹29,990/year (saves ~17%)
  },
} as const;

/**
 * Currency for all payments.
 */
export const CURRENCY = "INR";
