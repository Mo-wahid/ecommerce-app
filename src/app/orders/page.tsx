"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, Clock, CheckCircle2, XCircle, Truck, Loader2 } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<import("@/types").IUser | null>(null);
  const [orders, setOrders] = useState<import("@/types").IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchOrders(parsedUser.id);
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch(`/api/orders?userId=${userId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Delivered":
        return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
      case "Shipped":
      case "Processing":
        return { icon: Truck, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
      case "Cancelled":
        return { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" };
      case "Pending":
      default:
        return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-slate-600 font-medium animate-pulse">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-2xl mx-auto mt-10">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">No orders yet</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Looks like you haven't placed any orders. Let's find some amazing products for you!</p>
        <Link 
          href="/products" 
          className="bg-brand-600 text-white px-8 py-3.5 rounded-xl hover:bg-brand-700 font-bold transition-all shadow-md shadow-brand-600/20"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-6">
        <Package className="w-8 h-8 text-brand-600" />
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Orders</h1>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const StatusIcon = getStatusConfig(order.orderStatus).icon;
          const statusColors = getStatusConfig(order.orderStatus);

          return (
            <div key={order._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <p className="text-slate-500 font-medium mb-0.5">Order Placed</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium mb-0.5">Total Amount</p>
                    <p className="font-semibold text-brand-600">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-slate-500 font-medium mb-0.5">Order ID</p>
                    <p className="font-semibold text-slate-900">{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${statusColors.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${statusColors.color}`} />
                  <span className={`text-sm font-bold ${statusColors.color}`}>{order.orderStatus}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Items in this order</h3>
                <div className="space-y-6">
                  {order.orderItems.map((item: import("@/types").IOrderProduct, index: number) => {
                    // Handle case where product might have been deleted from DB
                    if (!item.product) return null;
                    
                    return (
                      <div key={`${order._id}-${index}`} className="flex items-center gap-4 sm:gap-6">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          <Image 
                            src={item.product.imageUrl || "https://via.placeholder.com/150"} 
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div className="flex-grow">
                          <Link href={`/products/${item.product._id}`} className="text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                            {item.product.name}
                          </Link>
                          <p className="text-slate-500 text-sm mt-1">{item.product.category}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm font-medium">
                            <span className="text-slate-600">Qty: {item.quantity}</span>
                            <span className="text-slate-900 font-bold">${item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
