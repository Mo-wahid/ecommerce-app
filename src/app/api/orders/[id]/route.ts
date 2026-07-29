import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const order = await Order.findOne({ _id: id }).populate("orderItems.product");
    
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }
    
    if (order.user.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    // Format for the success page
    const orderDetails = {
      id: order._id.toString(),
      totalAmount: order.totalAmount,
      status: order.paymentStatus === 'Paid' ? 'PAID' : (order.orderStatus.toUpperCase() || 'PENDING'),
      createdAt: order.createdAt,
      items: order.orderItems.map((item: any) => ({
        id: item.product?._id?.toString() || Math.random().toString(),
        name: item.product?.name || "Deleted Product",
        price: item.price,
        quantity: item.quantity
      }))
    };

    return NextResponse.json(orderDetails, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching order details." }, { status: 500 });
  }
}

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
