import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { apiLimiter } from "@/lib/security/rate-limit";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ subscription: data || null });
  } catch (error) {
    console.error("[Subscriptions API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateResult = apiLimiter.check(`subscriptions:${ip}`);
    if (rateResult.blocked) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      plan,
      interval,
    } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification parameters" },
        { status: 400 },
      );
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed — invalid signature" },
        { status: 400 },
      );
    }

    // Update subscription to active
    const serviceClient = createServiceClient();
    const { error: updateError } = await serviceClient
      .from("subscriptions")
      .update({
        plan: plan || "starter",
        status: "active",
        provider_subscription_id: razorpay_payment_id,
        metadata: {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          interval: interval || "monthly",
        },
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[Subscriptions API] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 },
      );
    }

    // Log audit
    await serviceClient.from("audit_logs").insert({
      user_id: user.id,
      action: "subscription.activated",
      resource: "subscription",
      details: { plan, interval, paymentId: razorpay_payment_id },
    });

    return NextResponse.json({ status: "active", plan });
  } catch (error) {
    console.error("[Subscriptions API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process payment verification" },
      { status: 500 },
    );
  }
}
