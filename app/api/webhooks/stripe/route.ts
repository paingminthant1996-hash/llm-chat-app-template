// app/api/webhooks/stripe/route.ts
// Stripe Webhook Handler
// Handles checkout.session.completed events and creates purchase records

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendPurchaseConfirmationEmail } from "@/app/actions/send-email";

// Lazy initialization to avoid build-time errors
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
  });
};

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not set");
  }
  return createClient(url, key);
};

export async function POST(req: NextRequest) {
  try {
    // Initialize clients (will throw if env vars missing - this is OK, route will fail at runtime)
    const stripe = getStripe();
    const supabase = getSupabase();

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Webhook secret is optional for development
    // In production, this should be set
    if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === "whsec_1234567890abcdef...") {
      console.warn("STRIPE_WEBHOOK_SECRET not configured. Webhook verification skipped. This is OK for development.");
      // For development, we can skip verification but log a warning
      // In production, you should set up proper webhook secret
    }

    if (!signature) {
      console.error("Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature (skip if secret not configured)
    let event: Stripe.Event;
    try {
      if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET !== "whsec_1234567890abcdef...") {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } else {
        // For development: parse event without verification
        console.warn("Webhook verification skipped - using development mode");
        event = JSON.parse(body) as Stripe.Event;
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Extract metadata from session
      const templateId = session.metadata?.templateId;
      const templateSlug = session.metadata?.templateSlug;
      const templateTitle = session.metadata?.templateTitle;

      if (!templateId) {
        console.error("Missing templateId in session metadata");
        return NextResponse.json(
          { error: "Missing templateId" },
          { status: 400 }
        );
      }

      // Get customer email from session
      const customerEmail = session.customer_email || session.customer_details?.email;
      if (!customerEmail) {
        console.error("Missing customer email in session");
        return NextResponse.json(
          { error: "Missing customer email" },
          { status: 400 }
        );
      }

      // Get user_id from Supabase Auth by email (or create user if needed)
      // For now, we'll need to handle this - you might want to create a user or link to existing
      // This is a simplified version - adjust based on your auth flow
      let userId: string | null = null;

      // Try to find user by email
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const user = authUsers?.users.find((u) => u.email === customerEmail);
      if (user) {
        userId = user.id;
      }

      // If no user found, you might want to:
      // 1. Create a new user
      // 2. Use a guest purchase system
      // 3. Link by email later
      // For now, we'll skip if no user found (adjust based on your needs)
      if (!userId) {
        console.warn(`No user found for email: ${customerEmail}. Purchase not recorded.`);
        // You might want to create a guest purchase or handle differently
        return NextResponse.json(
          { error: "User not found. Please ensure user is registered." },
          { status: 400 }
        );
      }

      // Get the latest template_version for this template
      const { data: templateVersion, error: versionError } = await supabase
        .from("template_versions")
        .select("id")
        .eq("template_id", templateId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (versionError || !templateVersion) {
        console.error("Failed to find template version:", versionError);
        return NextResponse.json(
          { error: "Template version not found" },
          { status: 404 }
        );
      }

      // Calculate price from session (in cents, convert to dollars)
      const amountTotal = session.amount_total || 0;
      const price = amountTotal / 100;

      // Create purchase record in purchases_v2
      const { error: purchaseError } = await supabase.from("purchases_v2").insert({
        user_id: userId,
        template_version_id: templateVersion.id,
        price: price,
        currency: session.currency?.toUpperCase() || "USD",
        stripe_payment_intent: session.payment_intent as string | null,
        stripe_session_id: session.id,
        granted: true,
        refunded: false,
        purchased_at: new Date().toISOString(),
        expires_at: null, // Or set expiration if needed
        metadata: {
          template_slug: templateSlug,
          template_title: templateTitle,
          customer_email: customerEmail,
        },
      });

      if (purchaseError) {
        console.error("Failed to create purchase record:", purchaseError);
        return NextResponse.json(
          { error: "Failed to record purchase" },
          { status: 500 }
        );
      }

      // Send purchase confirmation email
      if (templateTitle) {
        try {
          await sendPurchaseConfirmationEmail(
            customerEmail,
            templateTitle,
            price,
            session.currency?.toUpperCase() || "USD"
          );
          console.log(`Purchase confirmation email sent to ${customerEmail}`);
        } catch (emailError) {
          // Don't fail the webhook if email fails
          console.error("Failed to send purchase confirmation email:", emailError);
        }
      }

      console.log(`Purchase recorded for user ${userId}, template ${templateId}`);
      return NextResponse.json({ received: true, purchase_recorded: true });
    }

    // Handle other event types if needed
    console.log(`Unhandled event type: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

