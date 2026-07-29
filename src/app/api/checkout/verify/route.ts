import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-06-24.dahlia" as any,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { paymentIntentId, orderId } = await request.json();

    if (!paymentIntentId || !orderId) {
      return NextResponse.json({ success: false, message: "Missing parameters" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      await dbConnect();
      
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId, user: session.user.id, paymentStatus: "Unpaid" },
        {
          paymentStatus: "Paid",
          orderStatus: "Processing",
          stripeSessionId: paymentIntentId,
        },
        { new: true }
      );

      // if it was updated, clear cart
      if (updatedOrder) {
        await Cart.findOneAndUpdate({ user: session.user.id }, { products: [] });
      }

      return NextResponse.json({ success: true, message: "Payment verified" });
    }

    return NextResponse.json({ success: false, message: "Payment not successful" }, { status: 400 });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
