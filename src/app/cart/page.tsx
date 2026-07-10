"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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

  if (status === "loading" || loading) return <div className="text-center py-12">Loading cart...</div>;

  if (!user) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">Your cart is waiting!</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">Please log in to view and manage your cart.</p>
        <Link href="/?login=true" className="bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-700">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 border-b dark:border-slate-800 pb-4">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 transition-colors">
          <p className="text-gray-500 dark:text-slate-400 mb-4 text-lg">Your cart is currently empty.</p>
          <Link href="/products" className="text-brand-600 hover:underline">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.product._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-900 rounded flex-shrink-0">
                    <img src={item.product.imageUrl || "https://via.placeholder.com/64"} alt={item.product.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{item.product.name}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="font-bold text-gray-900 dark:text-slate-100">${(item.product.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.product._id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button onClick={clearCart} className="text-sm text-gray-500 hover:text-red-600 font-medium pt-2">
              Clear Entire Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm h-fit transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2 text-gray-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600 dark:text-slate-400">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t dark:border-slate-700 pt-4 flex justify-between font-bold text-lg text-slate-900 dark:text-slate-100 mb-6">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Link 
              href="/checkout"
              className="w-full flex justify-center items-center bg-brand-600 text-white py-3.5 rounded-xl hover:bg-brand-700 font-bold transition-colors shadow-md shadow-brand-600/20 text-lg"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}