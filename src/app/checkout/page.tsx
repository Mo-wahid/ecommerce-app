"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CreditCard, Truck, AlertCircle, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingCart } from "lucide-react";
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
      <div className="py-12 max-w-xl mx-auto">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="You need items in your cart to checkout."
          action={
            <Button onPress={() => router.push("/products")}>
              Return to Shop
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground border-b border-border pb-4">Checkout</h1>

      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm transition-colors">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">Shipping Information</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Username</label>
                <Input
                  type="text"
                  required
                  className="h-11 rounded-xl"
                  value={formData.fullName}
                  onChange={(e: any) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Street Address</label>
                <Input
                  type="text"
                  required
                  className="h-11 rounded-xl"
                  value={formData.address}
                  onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">City</label>
                  <Input
                    type="text"
                    required
                    className="h-11 rounded-xl"
                    value={formData.city}
                    onChange={(e: any) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Postal Code</label>
                  <Input
                    type="text"
                    required
                    className="h-11 rounded-xl"
                    value={formData.postalCode}
                    onChange={(e: any) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                <Select
                  aria-label="Select Country"
                  selectedKey={formData.country}
                  onSelectionChange={(key) => setFormData({ ...formData, country: key?.toString() || "" })}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id="United States" textValue="United States">United States</SelectItem>
                    <SelectItem id="Canada" textValue="Canada">Canada</SelectItem>
                    <SelectItem id="United Kingdom" textValue="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem id="Germany" textValue="Germany">Germany</SelectItem>
                    <SelectItem id="France" textValue="France">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-fit transition-colors">
          <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            {cart.map((item) => (
              <div key={item.product._id} className="flex justify-between text-sm">
                <span className="text-muted-foreground truncate pr-4">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="font-medium text-foreground">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />
          
          <div className="mb-2 flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground mb-4">
            <span>Shipping</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
          </div>
          
          <Separator className="my-4" />

          <div className="flex justify-between font-bold text-xl text-foreground mb-6">
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