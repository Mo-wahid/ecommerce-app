import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    if (!body.orderStatus) {
      return NextResponse.json({ success: false, message: "Order status is required" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus: body.orderStatus },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error updating order status." }, { status: 500 });
  }
}
