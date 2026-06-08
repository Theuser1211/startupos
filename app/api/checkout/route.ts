import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createOrder } from "@/lib/razorpay";
import { apiLimiter } from "@/lib/security/rate-limit";
import type { SubscriptionPlan } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateResult = apiLimiter.check(`checkout:${ip}`);
    if (rateResult.blocked) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, interval } = body as {
      plan: SubscriptionPlan;
      interval: "monthly" | "yearly";
    };

    if (!["starter", "pro"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Choose 'starter' or 'pro'." },
        { status: 400 },
      );
    }

    if (!["monthly", "yearly"].includes(interval)) {
      return NextResponse.json(
        { error: "Invalid interval. Choose 'monthly' or 'yearly'." },
        { status: 400 },
      );
    }

    // Price configuration
    const prices: Record<string, Record<string, number>> = {
      starter: { monthly: 99900, yearly: 999000 },
      pro: { monthly: 299900, yearly: 2999000 },
    };

    const amount = prices[plan]?.[interval];
    if (!amount) {
      return NextResponse.json({ error: "Invalid pricing configuration" }, { status: 500 });
    }

    // Create Razorpay order
    const order = await createOrder({
      amount,
      currency: "INR",
      receipt: `startupos-${plan}-${interval}-${user.id.substring(0, 8)}`,
      notes: {
        userId: user.id,
        plan,
        interval,
      },
    });

    // Store order reference in database
    const serviceClient = createServiceClient();
    await serviceClient.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan,
        status: "incomplete",
        provider: "razorpay",
        provider_subscription_id: order.id,
        metadata: {
          orderId: order.id,
          interval,
          amount,
          currency: "INR",
        },
      },
      { onConflict: "user_id" },
    );

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[Checkout API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
