import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // Run all database count queries in parallel for better performance
    const [totalProducts, totalOrders, totalUsers, recentOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.find()
        .populate("user", "name email") 
        .sort({ createdAt: -1 })
        .limit(5), 
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          totalProducts,
          totalOrders,
          totalUsers,
          recentOrders,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching dashboard statistics." },
      { status: 500 }
    );
  }
}