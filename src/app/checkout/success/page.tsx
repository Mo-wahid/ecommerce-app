"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Clear the cart when payment succeeds
    const clearCart = async () => {
      try {
        await fetch("/api/cart", { method: "DELETE" });
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
    };

    if (sessionId) {
      clearCart();
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Invalid Session</h1>
        <Button onClick={() => router.push("/")}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background px-4">
      <div className="bg-card p-8 md:p-12 rounded-3xl border border-border shadow-sm max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black mb-3">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. Your order <span className="font-mono text-foreground font-medium">{orderId?.slice(-6).toUpperCase()}</span> is currently being processed.
        </p>

        <div className="space-y-3">
          <Button onClick={() => router.push("/orders")} className="w-full h-12 rounded-xl text-[15px] font-bold">
            View Order Details <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button onClick={() => router.push("/products")} variant="outline" className="w-full h-12 rounded-xl text-[15px] font-bold">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
