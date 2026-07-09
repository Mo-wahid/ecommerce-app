import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET: Fetch order history for a user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    await dbConnect();

    // Fetch orders and populate the product details within the orderItems array
    const orders = await Order.find({ user: userId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching orders." }, { status: 500 });
  }
}

// POST: Place a new order (Checkout)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    await dbConnect();
    const { orderItems, totalAmount } = await request.json();

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ message: "Invalid order data." }, { status: 400 });
    }

    // 1. Create the new order
    const newOrder = await Order.create({
      user: userId,
      orderItems,
      totalAmount,
      orderStatus: "Pending",
    });

    // 2. Clear the user's cart after a successful order
    await Cart.findOneAndUpdate({ user: userId }, { products: [] });

    return NextResponse.json(
      { success: true, message: "Order placed successfully.", data: newOrder },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Error placing order." }, { status: 500 });
  }
}