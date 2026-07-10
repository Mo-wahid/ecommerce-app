"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [cart, setCart] = useState<import("@/types").ICartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // Customer information form state
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "Lahore",
    postalCode: "",
    country: "Pakistan",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && session?.user) {
      setFormData((prev) => ({ ...prev, fullName: user?.name || "" }));
      fetchCart();
    }
  }, [status, user, router]);

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
      setError("Failed to load cart data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setPlacingOrder(true);

    try {
      // Format the products to match the Order API expectation
      const orderItems = cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItems,
          totalAmount: subtotal,
          // If you updated your Order model to include shipping details, 
          // you would also pass formData here.
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to place order.");
      }

      // Clear the local cart state just in case, though the backend handles it
      setCart([]);
      
      // Redirect to a success or orders page
      router.push("/orders");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setPlacingOrder(false);
    }
  };

  if (status === "loading" || loading) return <div className="text-center py-12">Loading checkout...</div>;

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">You need items in your cart to checkout.</p>
        <Link href="/products" className="bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-700">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 border-b dark:border-slate-800 pb-4">Checkout</h1>

      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Shipping Information</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Country</label>
                <select
                  required
                  className="w-full px-4 py-2 text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="India">India</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                </select>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm h-fit transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <div key={item.product._id} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400 truncate pr-4">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="font-medium text-gray-900 dark:text-slate-100">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mb-2 flex justify-between text-gray-600 dark:text-slate-400">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-slate-400 mb-6">
            <span>Shipping</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
          </div>
          
          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 flex justify-between font-bold text-xl text-gray-900 dark:text-slate-100 mb-6">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={placingOrder}
            className="w-full bg-gray-900 text-white py-3 rounded hover:bg-gray-800 font-bold transition-colors disabled:bg-gray-400"
          >
            {placingOrder ? "Processing..." : "Place Order"}
          </button>
        </div>

      </div>
    </div>
  );
}