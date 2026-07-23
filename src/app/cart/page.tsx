"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, LogIn, Loader2 } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [cart, setCart] = useState<import("@/types").ICartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Check for logged-in user and fetch their cart
  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
    } else if (status === "authenticated" && user) {
      fetchCart();
    }
  }, [status, user]);

  const fetchCart = async () => {
    try {
      const res = await fetch(`/api/cart`);
      const json = await res.json();
      if (json.success && json.data.cart) {
        setCart(json.data.cart.products);
        setSubtotal(json.data.subtotal);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Remove an item completely
  const removeItem = async (productId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) fetchCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  // 3. Clear the whole cart
  const clearCart = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Omitting productId clears everything
      });
      if (res.ok) fetchCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-12">
        <EmptyState
          icon={LogIn}
          title="Your cart is waiting!"
          description="Please log in to view and manage your cart."
          action={
            <Button onPress={() => router.push("/?login=true")}>
              Login Now
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground border-b border-border pb-4">Shopping Cart</h1>

      {cart.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          action={
            <Button onPress={() => router.push("/products")}>
              Browse Products
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.product._id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-sm transition-colors">
                <div className="flex items-center space-x-4">
                  <Link href={`/products/${item.product._id}`} className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 block overflow-hidden group relative">
                    <Image src={item.product.imageUrl || "https://via.placeholder.com/64"} alt={item.product.name} width={64} height={64} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
                  </Link>
                  <div>
                    <Link href={`/products/${item.product._id}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors block">
                      {item.product.name}
                    </Link>
                    <p className="text-muted-foreground text-sm mt-1">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="font-bold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.product._id)} className="text-destructive hover:underline text-sm font-medium">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-destructive font-medium pt-2">
              Clear Entire Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-fit transition-colors">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2 text-muted-foreground">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4 text-muted-foreground">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg text-foreground mb-6">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Link 
              href="/checkout"
              className="w-full flex justify-center items-center bg-primary text-primary-foreground py-3.5 rounded-xl hover:bg-primary/90 font-bold transition-colors shadow-md text-lg"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}