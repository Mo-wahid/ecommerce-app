"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, LogIn, Loader2, Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [cart, setCart] = useState<import("@/types").ICartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

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

  const updateQuantity = async (productId: string, currentQuantity: number, change: number) => {
    if (!user) return;
    
    const newQuantity = currentQuantity + change;
    
    if (newQuantity <= 0) {
      return removeItem(productId);
    }

    setUpdatingItems((prev) => new Set(prev).add(productId));
    
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      
      const json = await res.json();
      
      if (json.success) {
        await fetchCart();
      } else {
        toast.error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("An error occurred while updating the cart");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // 2. Remove an item completely
  const removeItem = async (productId: string) => {
    if (!user) return;
    
    setUpdatingItems((prev) => new Set(prev).add(productId));
    
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        toast.success("Item removed from cart");
        await fetchCart();
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("An error occurred while removing the item");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // 3. Clear the whole cart
  const clearCart = async () => {
    if (!user) return;
    setClearing(true);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Omitting productId clears everything
      });
      if (res.ok) {
        toast.success("Cart cleared successfully");
        await fetchCart();
      } else {
        toast.error("Failed to clear cart");
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("An error occurred while clearing the cart");
    } finally {
      setClearing(false);
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
    <div className="space-y-8 pb-12">
      <h1 className="text-3xl font-bold tracking-tight text-foreground border-b border-border pb-6">Shopping Cart</h1>

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 relative items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <div className="space-y-4">
              {cart.map((item) => {
                const isUpdating = updatingItems.has(item.product._id);
                return (
                  <div 
                    key={item.product._id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 gap-4 ${isUpdating ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-center space-x-5">
                      <Link href={`/products/${item.product._id}`} className="w-24 h-24 bg-muted rounded-xl flex-shrink-0 block overflow-hidden group relative">
                        <img 
                          src={item.product.imageUrl || "https://via.placeholder.com/96"} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        {isUpdating && (
                          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-col">
                        <Link href={`/products/${item.product._id}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                          {item.product.name}
                        </Link>
                        <span className="font-bold text-foreground mt-2">${item.product.price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4 sm:gap-2">
                      <div className="flex items-center bg-muted rounded-full p-1 border border-border">
                        <Button 
                          variant="ghost"
                          size="icon"
                          onPress={() => updateQuantity(item.product._id, item.quantity, -1)}
                          isDisabled={isUpdating}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium text-foreground text-sm">{item.quantity}</span>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onPress={() => updateQuantity(item.product._id, item.quantity, 1)}
                          isDisabled={isUpdating}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 sm:gap-2">
                        <span className="font-bold text-lg sm:hidden">${(item.product.price * item.quantity).toFixed(2)}</span>
                        <Button 
                          variant="ghost"
                          onPress={() => removeItem(item.product._id)} 
                          isDisabled={isUpdating}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive text-sm font-medium transition-colors p-2 sm:p-0 rounded-lg sm:hover:bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sm:hidden">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-end pt-2">
              <Button 
                variant="ghost"
                onPress={clearCart} 
                isDisabled={clearing}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive font-medium transition-colors disabled:opacity-50"
              >
                {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Clear Entire Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-md transition-all">
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-medium text-foreground">Calculated at checkout</span>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="flex justify-between font-bold text-xl text-foreground mb-8">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Link 
                href="/checkout"
                className="w-full flex justify-center items-center bg-primary text-primary-foreground py-4 rounded-xl hover:bg-primary/90 font-bold transition-all shadow-md text-lg active:scale-[0.98]"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}