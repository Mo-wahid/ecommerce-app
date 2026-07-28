export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";

// GET: Fetch all products (Public)
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const sort = searchParams.get("sort") || "newest";

    const query: any = {};
    
    if (search) {
      // Use MongoDB text index for optimized search
      query.$text = { $search: search };
    }
    
    if (category && category !== "All" && category !== "All Categories") {
      query.category = category;
    }

    // Determine sort object
    let sortObj: any = { createdAt: -1 }; // Default: newest
    if (sort === "price_asc") sortObj = { price: 1 };
    else if (sort === "price_desc") sortObj = { price: -1 };
    else if (sort === "oldest") sortObj = { createdAt: 1 };

    const skip = (page - 1) * limit;

    // Fetch products and total count in parallel
    const [products, totalCount] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({ 
      success: true, 
      data: products, 
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    }, { status: 200 });
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