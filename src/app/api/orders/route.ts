import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Cart from "@/models/Cart";

// GET: Fetch order history for a user
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    // Fetch orders and populate the product details within the orderedProducts array
    const orders = await Order.find({ user: userId })
      .populate("orderedProducts.product")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching orders." }, { status: 500 });
  }
}

// POST: Place a new order (Checkout)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userId, orderedProducts, totalAmount } = await request.json();

    if (!userId || !orderedProducts || orderedProducts.length === 0) {
      return NextResponse.json({ message: "Invalid order data." }, { status: 400 });
    }

    // 1. Create the new order
    const newOrder = await Order.create({
      user: userId,
      orderedProducts,
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