import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

// GET: Fetch a single product by ID (Public)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching product." }, { status: 500 });
  }
}

// PUT: Update an existing product (Admin)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // findByIdAndUpdate returns the old document by default. { new: true } returns the updated one.
    const product = await Product.findByIdAndUpdate(params.id, body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error updating product." }, { status: 500 });
  }
}

// DELETE: Remove a product (Admin)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const product = await Product.findByIdAndDelete(params.id);
    
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Product deleted successfully." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error deleting product." }, { status: 500 });
  }
}