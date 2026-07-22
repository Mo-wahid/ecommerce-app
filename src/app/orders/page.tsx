"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, Clock, CheckCircle2, XCircle, Truck } from "lucide-react";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/Loading";

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [orders, setOrders] = useState<import("@/types").IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && session?.user) {
      fetchOrders();
    }
  }, [status, user, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders`);
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
        return { icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" };
      case "Shipped":
      case "Processing":
        return { icon: Truck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" };
      case "Cancelled":
        return { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" };
      case "Pending":
      default:
        return { icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" };
    }
  };

  if (status === "loading" || loading) {
    return <Loading fullScreen message="Loading your orders..." />;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm max-w-2xl mx-auto mt-10 transition-colors">
        <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight">No orders yet</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Looks like you haven't placed any orders. Let's find some amazing products for you!</p>
        <Link 
          href="/products" 
          className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl hover:bg-primary/90 font-bold transition-all shadow-md"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <Package className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-black text-foreground tracking-tight">Your Orders</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => {
          const StatusIcon = getStatusConfig(order.orderStatus).icon;
          const statusColors = getStatusConfig(order.orderStatus);

          return (
            <div key={order._id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Order Header */}
              <div className="bg-muted/40 px-5 py-4 border-b border-border flex justify-between items-start gap-4">
                <div className="text-sm space-y-1.5">
                  <p className="text-muted-foreground">Placed: <span className="font-semibold text-foreground">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                  <p className="text-muted-foreground">Total: <span className="font-semibold text-foreground">${order.totalAmount.toFixed(2)}</span></p>
                  <p className="text-muted-foreground">ID: <span className="font-semibold text-foreground">{order._id.substring(order._id.length - 8).toUpperCase()}</span></p>
                </div>
                
                <div className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${statusColors.bg}`}>
                  <StatusIcon className={`w-3.5 h-3.5 ${statusColors.color}`} />
                  <span className={`text-xs font-bold ${statusColors.color}`}>{order.orderStatus}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Items in order</h3>
                <div className="space-y-4">
                  {order.orderItems.map((item: import("@/types").IOrderProduct, index: number) => {
                    if (!item.product) return null;
                    
                    return (
                      <div key={`${order._id}-${index}`} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0 border border-border">
                          <Image 
                            src={item.product.imageUrl || "https://via.placeholder.com/150"} 
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <Link href={`/products/${item.product._id}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate block">
                            {item.product.name}
                          </Link>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-muted-foreground text-xs">Qty: {item.quantity}</span>
                            <span className="text-foreground text-sm font-bold">${item.price.toFixed(2)}</span>
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
