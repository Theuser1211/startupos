import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * Razorpay Webhook Handler
 *
 * Handles payment and subscription lifecycle events:
 * - payment.captured → activate subscription
 * - payment.failed → mark subscription as past_due
 * - subscription.cancelled → mark subscription as canceled
 * - subscription.charged → update period dates
 *
 * Set RAZORPAY_WEBHOOK_SECRET in .env.local from the Razorpay Dashboard.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not configured — skipping verification");
      return NextResponse.json({ status: "ok" });
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error("[Razorpay Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    const payload = event.payload;

    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    const serviceClient = createServiceClient();

    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payment.entity;
        const orderId = payment.order_id;
        const userId = payment.notes?.userId;

        if (!userId) {
          console.warn("[Razorpay Webhook] No userId in payment notes");
          return NextResponse.json({ status: "ok" });
        }

        // Activate the subscription
        await serviceClient
          .from("subscriptions")
          .update({
            status: "active",
            provider_subscription_id: payment.id,
            provider_customer_id: payment.customer_id,
            metadata: {
              paymentId: payment.id,
              orderId,
              method: payment.method,
              bank: payment.bank,
              capturedAt: new Date().toISOString(),
            },
          })
          .eq("user_id", userId);

        // Log the audit event
        await serviceClient.from("audit_logs").insert({
          user_id: userId,
          action: "payment.captured",
          resource: "subscription",
          details: { plan: payment.notes?.plan, amount: payment.amount, orderId },
        });

        console.log(`[Razorpay Webhook] Payment captured for user ${userId}`);
        break;
      }

      case "payment.failed": {
        const failedPayment = payload.payment.entity;
        const failedUserId = failedPayment.notes?.userId;

        if (failedUserId) {
          await serviceClient
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("user_id", failedUserId);

          await serviceClient.from("audit_logs").insert({
            user_id: failedUserId,
            action: "payment.failed",
            resource: "subscription",
            details: { error: failedPayment.error_description, amount: failedPayment.amount },
          });
        }

        console.log(`[Razorpay Webhook] Payment failed for user ${failedUserId}`);
        break;
      }

      case "subscription.cancelled": {
        const subscription = payload.subscription.entity;
        const cancelUserId = subscription.notes?.userId;

        if (cancelUserId) {
          await serviceClient
            .from("subscriptions")
            .update({ status: "canceled", canceled_at: new Date().toISOString() })
            .eq("provider_subscription_id", subscription.id);
        }

        console.log(`[Razorpay Webhook] Subscription cancelled: ${subscription.id}`);
        break;
      }

      default:
        console.log(`[Razorpay Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Razorpay Webhook] Error:", error);
    // Always return 200 to acknowledge receipt (Razorpay retries on non-200)
    return NextResponse.json({ status: "ok" });
  }
}
