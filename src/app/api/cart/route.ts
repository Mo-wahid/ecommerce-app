import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

// GET: View Cart & Subtotal
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    // Fetch cart and populate product details to calculate the subtotal
    const cart = await Cart.findOne({ user: userId }).populate("products.product");

    if (!cart) {
      return NextResponse.json({ success: true, data: { products: [], subtotal: 0 } }, { status: 200 });
    }

    // Calculate subtotal
    let subtotal = 0;
    cart.products.forEach((item: { product: { _id: string; price: number }, quantity: number }) => {
      subtotal += item.quantity * item.product.price;
    });

    return NextResponse.json({ success: true, data: { cart, subtotal } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching cart." }, { status: 500 });
  }
}

// POST: Add Item or Update Quantity
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userId, productId, quantity } = await request.json();

    if (!userId || !productId || !quantity) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Ensure the product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return NextResponse.json({ message: "Product not found or insufficient stock." }, { status: 404 });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create a new cart if one doesn't exist for the user
      cart = await Cart.create({
        user: userId,
        products: [{ product: productId, quantity }],
      });
    } else {
      // Check if product is already in the cart
      const itemIndex = cart.products.findIndex((p: { product: import("mongoose").Types.ObjectId }) => p.product.toString() === productId);

      if (itemIndex > -1) {
        // Update quantity
        cart.products[itemIndex].quantity = quantity;
      } else {
        // Add new product to cart array
        cart.products.push({ product: productId, quantity });
      }
      await cart.save();
    }

    return NextResponse.json({ success: true, message: "Cart updated successfully.", data: cart }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating cart." }, { status: 500 });
  }
}

// DELETE: Remove a single item OR Clear the whole cart
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { userId, productId } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return NextResponse.json({ message: "Cart not found." }, { status: 404 });
    }

    if (productId) {
      // Remove specific product from cart
      cart.products = cart.products.filter((p: { product: import("mongoose").Types.ObjectId }) => p.product.toString() !== productId);
      await cart.save();
      return NextResponse.json({ success: true, message: "Item removed from cart.", data: cart }, { status: 200 });
    } else {
      // Clear the entire cart if no productId is provided
      cart.products = [];
      await cart.save();
      return NextResponse.json({ success: true, message: "Cart cleared successfully." }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error removing item from cart." }, { status: 500 });
  }
}