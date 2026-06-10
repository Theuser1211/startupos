import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createOrder } from "@/lib/razorpay";
import { apiLimiter } from "@/lib/security/rate-limit";
import { z } from "zod";

const CheckoutSchema = z.object({
  plan: z.enum(["starter", "pro"]),
  interval: z.enum(["monthly", "yearly"]),
});

type CheckoutRequest = z.infer<typeof CheckoutSchema>;

const PRICES: Record<string, Record<string, number>> = {
  starter: { monthly: 99900, yearly: 999000 },
  pro: { monthly: 299900, yearly: 2999000 },
} as const;

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
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: `Invalid request: ${parsed.error.issues.map(i => i.message).join(", ")}` },
        { status: 400 },
      );
    }
    const { plan, interval } = parsed.data as CheckoutRequest;

    const amount = PRICES[plan]?.[interval];
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
      { error: "Failed to create checkout order" },
      { status: 500 },
    );
  }
}
