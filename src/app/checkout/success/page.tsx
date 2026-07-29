"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Package, Calendar, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderDetails {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: string; delay: string; bg: string; dur: string }>>([]);

  useEffect(() => {
    // Generate confetti
    const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#f97316"];
    const newConfetti = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      delay: `${Math.random() * 2}s`,
      bg: colors[Math.floor(Math.random() * colors.length)],
      dur: `${3 + Math.random() * 2}s`,
    }));
    setConfetti(newConfetti);

    const clearCart = async () => {
      try {
        await fetch("/api/cart", { method: "DELETE" });
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
    };

    if (sessionId || orderId) {
      clearCart();
    }
  }, [sessionId, orderId]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrderDetails(data);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);

  const deliveryDateStart = new Date();
  deliveryDateStart.setDate(deliveryDateStart.getDate() + 7);
  const deliveryDateEnd = new Date();
  deliveryDateEnd.setDate(deliveryDateEnd.getDate() + 14);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Confetti styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          top: -20px;
          width: 10px;
          height: 10px;
          z-index: 50;
          animation: fall linear forwards;
        }
      `}} />
      
      {confetti.map((c) => (
        <div 
          key={c.id} 
          className="confetti-piece"
          style={{
            left: c.left,
            backgroundColor: c.bg,
            animationDelay: c.delay,
            animationDuration: c.dur,
          }}
        />
      ))}

      <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-lg p-6 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700 z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            {!orderId ? 
              "We couldn't find your order details, but your payment was successful!" : 
              "Thank you for your purchase. We've received your order and will begin processing it right away."}
          </p>
        </div>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            Loading order details...
          </div>
        ) : orderDetails ? (
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Order Number</p>
                  <p className="font-mono text-foreground font-bold">{orderDetails.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground font-medium">Date Placed</p>
                  <p className="text-foreground font-medium">
                    {new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center">
                    <Package className="w-4 h-4 mr-2 text-primary" />
                    Order Summary
                  </h3>
                  <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold text-xs uppercase tracking-wide">
                    {orderDetails.status || "PROCESSING"}
                  </span>
                </div>
                <div className="space-y-3">
                  {orderDetails.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <span className="text-muted-foreground w-6">{item.quantity}x</span>
                        <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-[300px]">{item.name}</span>
                      </div>
                      <span className="text-foreground font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" /> Total Amount Paid
                </span>
                <span className="text-2xl font-black text-foreground">
                  ${orderDetails.totalAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 flex items-start">
              <Calendar className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground text-sm">Estimated Delivery</h4>
                <p className="text-muted-foreground text-sm mt-1">
                  Arriving between <span className="text-foreground font-medium">{formatDate(deliveryDateStart)}</span> and <span className="text-foreground font-medium">{formatDate(deliveryDateEnd)}</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-2xl p-6 border border-border text-center">
            <p className="text-muted-foreground mb-2">Your payment has been processed successfully.</p>
            <p className="text-sm">Check your email for the order receipt and details.</p>
          </div>
        )}

        <div className="mt-8 space-y-3 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3">
          <Button onPress={() => router.push("/orders")} className="flex-1 h-14 rounded-xl text-[15px] font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all">
            View My Orders <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button onPress={() => router.push("/products")} variant="outline" className="flex-1 h-14 rounded-xl text-[15px] font-bold bg-background">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
