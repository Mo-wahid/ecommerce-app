"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Clock, CheckCircle2, XCircle, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function StripePaymentForm({ orderId, amount }: { orderId: string, amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "An error occurred");
      setLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order_id=${orderId}`,
      },
    });

    if (result.error) {
      setError(result.error.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="text-sm font-medium text-destructive">{error}</div>}
      <Button type="submit" isDisabled={!stripe || loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Pay ${amount.toFixed(2)}
      </Button>
    </form>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [orders, setOrders] = useState<import("@/types").IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [paymentModalData, setPaymentModalData] = useState<{orderId: string, clientSecret: string, amount: number} | null>(null);

  const handlePayment = async (order: import("@/types").IOrder) => {
    setPayingOrderId(order._id);
    try {
      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setPaymentModalData({ orderId: order._id, clientSecret: data.clientSecret, amount: order.totalAmount });
      } else {
        toast.error("Failed to initiate payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment");
    } finally {
      setPayingOrderId(null);
    }
  };

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
      <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm max-w-2xl mx-auto mt-10 transition-colors">
        <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight">No orders yet</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Looks like you haven't placed any orders. Let's find some amazing products for you!</p>
        <Link 
          href="/products" 
          className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl hover:bg-primary/90 font-bold transition-all shadow-md inline-block"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <Package className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Your Orders</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => {
          const StatusIcon = getStatusConfig(order.orderStatus).icon;
          const statusColors = getStatusConfig(order.orderStatus);

          return (
            <div key={order._id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              {/* Order Header */}
              <div className="bg-muted/40 px-5 py-4 border-b border-border flex justify-between items-start gap-4">
                <div className="text-sm space-y-1.5">
                  <p className="text-muted-foreground">Placed: <span className="font-semibold text-foreground">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                  <p className="text-muted-foreground">Total: <span className="font-semibold text-foreground">${order.totalAmount.toFixed(2)}</span></p>
                  <p className="text-muted-foreground">ID: <span className="font-semibold text-foreground">{order._id.substring(order._id.length - 8).toUpperCase()}</span></p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusColors.bg}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${statusColors.color}`} />
                    <span className={`text-xs font-medium ${statusColors.color}`}>{order.orderStatus}</span>
                  </div>
                  {order.paymentStatus && (
                    <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                      order.paymentStatus.toLowerCase() === 'paid' 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                    }`}>
                      <span className="text-xs font-medium uppercase tracking-wider">{order.paymentStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5 flex-grow">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Items in order</p>
                <div className="space-y-4">
                  {order.orderItems.map((item: import("@/types").IOrderProduct, index: number) => {
                    if (!item.product) {
                      return (
                        <div key={`${order._id}-${index}`} className="flex items-center gap-4">
                          <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0 border border-border flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <span className="text-sm font-bold text-muted-foreground truncate block">
                              Product unavailable
                            </span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-muted-foreground text-xs">Qty: {item.quantity}</span>
                              <span className="text-foreground text-sm font-bold">${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={`${order._id}-${index}`} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0 border border-border">
                          <img 
                            src={item.product.imageUrl || "https://via.placeholder.com/150"} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
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

              {/* Order Actions */}
              <div className="p-4 border-t border-border bg-muted/20">
                {order.paymentStatus === 'Unpaid' ? (
                  <Button
                    type="button"
                    onPress={() => handlePayment(order)}
                    isDisabled={payingOrderId === order._id}
                    className="w-full"
                  >
                    {payingOrderId === order._id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Pay Now
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onPress={() => toast("Invoice download will be available soon.")}
                    className="w-full bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                  >
                    View Invoice
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog isOpen={!!paymentModalData} onOpenChange={(open) => !open && setPaymentModalData(null)} className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Enter your payment details below to complete your order.
          </DialogDescription>
        </DialogHeader>
        {paymentModalData && (
          <div className="mt-4">
            <Elements stripe={stripePromise} options={{ clientSecret: paymentModalData.clientSecret }}>
              <StripePaymentForm orderId={paymentModalData.orderId} amount={paymentModalData.amount} />
            </Elements>
          </div>
        )}
      </Dialog>
    </div>
  );
}
