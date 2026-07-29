import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Cart from "@/models/Cart";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-06-24.dahlia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ success: false, message: "No signature found" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ success: false, message: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await dbConnect();
        
        // Find the order and update status to Paid and Processing
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: "Paid",
            orderStatus: "Processing"
          },
          { new: true }
        );

        if (!updatedOrder) {
          console.error(`Webhook Error: Order ${orderId} not found in database.`);
          return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }
        console.log(`Order ${orderId} successfully marked as Paid via Stripe Webhook!`);
      } else {
        console.warn("Webhook Warning: No orderId found in session metadata.");
      }
    } else if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId;
      const userId = paymentIntent.metadata?.userId;

      if (orderId) {
        await dbConnect();
        
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: "Paid",
            orderStatus: "Processing",
            stripeSessionId: paymentIntent.id
          },
          { new: true }
        );

        if (!updatedOrder) {
          console.error(`Webhook Error: Order ${orderId} not found in database.`);
          return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }
        console.log(`Order ${orderId} successfully marked as Paid via Stripe Webhook (Payment Intent)!`);
        
        if (userId) {
          await Cart.findOneAndUpdate({ user: userId }, { products: [] });
        }
      } else {
        console.warn("Webhook Warning: No orderId found in payment_intent metadata.");
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
