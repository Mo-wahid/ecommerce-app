import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

// GET: Fetch all products (Public)
export async function GET() {
  try {
    await dbConnect();
    // Fetch all products and sort by newest first
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch products." }, { status: 500 });
  }
}

// POST: Create a new product (Admin)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Note: In a fully secure production app, you would extract the user's token here 
    // and verify their role === "Admin" before allowing creation.
    
    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create product.", error: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}