import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ status: 404 });

  const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ status: 500, error: "Missing STRIPE_SUBSCRIPTION_PRICE_ID" });
  }

  const baseUrl = (process.env.NEXT_PUBLIC_HOST_URL ?? "").replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: user.primaryEmailAddress?.emailAddress ?? undefined,
    client_reference_id: user.id,
    success_url: `${baseUrl}/payment?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/payment?cancel=true`,
  });
  if (session) {
    return NextResponse.json({
      status: 200,
      session_url: session.url,
    });
  }

  return NextResponse.json({ status: 400 });
}
