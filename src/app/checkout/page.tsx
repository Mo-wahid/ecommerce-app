"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShoppingCart, Percent, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
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
  
  const [shippingMethod, setShippingMethod] = useState<"free" | "express">("free");
  const shippingCost = shippingMethod === "express" ? 9 : 0;
  const estimatedTaxes = 5.00; // Mocked like in the screenshot
  const total = subtotal + shippingCost + estimatedTaxes;

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCountry: "IND",
    phone: "",
    address: "",
    city: "",
    country: "India",
    zip: "",
    description: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && session?.user) {
      setFormData((prev) => ({ 
        ...prev, 
        firstName: user?.name?.split(" ")[0] || "",
        lastName: user?.name?.split(" ").slice(1).join(" ") || "",
        email: user?.email || ""
      }));
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
          totalAmount: total,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order.");

      const orderId = data.data._id; // The order ID from the successful POST

      // Step 2: Initialize Stripe Checkout
      const stripeRes = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const stripeData = await stripeRes.json();
      if (!stripeRes.ok) throw new Error(stripeData.message || "Failed to initialize payment.");

      // Redirect to Stripe hosted checkout
      if (stripeData.url) {
        window.location.href = stripeData.url;
      } else {
        throw new Error("No Stripe URL returned");
      }
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
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
          action={<Button onPress={() => router.push("/products")}>Return to Shop</Button>}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-background min-h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 md:py-12 transition-colors">
      <div className="max-w-6xl mx-auto">
        {error && <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 mb-6 font-medium">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* Left Column: Form & Shipping */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
              
              {/* Breadcrumb */}
              <div className="flex items-center text-sm font-bold mb-8">
                <Link href="/cart" className="text-primary hover:underline transition-colors">Cart</Link>
                <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
                <span className="text-foreground">Shipping</span>
                <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
                <span className="text-muted-foreground">Payment</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Shipping Address</h2>
              
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">First Name*</label>
                    <Input required placeholder="Divyansh" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Last Name*</label>
                    <Input required placeholder="Agarwal" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Email*</label>
                    <Input type="email" required placeholder="divyansh@webyansh.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Phone number*</label>
                    <div className="flex h-12 rounded-xl border border-input focus-within:ring-1 focus-within:ring-ring transition-colors overflow-hidden bg-transparent">
                      <Select selectedKey={formData.phoneCountry} onSelectionChange={(k) => setFormData({...formData, phoneCountry: k?.toString()||"IND"})}>
                        <SelectTrigger className="w-[100px] shrink-0 border-0 h-full rounded-none bg-transparent focus:ring-0 shadow-none px-3 text-sm flex items-center justify-between">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem id="IND" textValue="IND">IND</SelectItem>
                          <SelectItem id="USA" textValue="USA">USA</SelectItem>
                          <SelectItem id="UK" textValue="UK">UK</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="w-[1px] bg-input my-2 shrink-0" />
                      <input 
                        required 
                        placeholder="+91 6377588843" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        className="flex-1 min-w-0 bg-transparent border-0 h-full px-3 text-sm focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Address*</label>
                  <Input required placeholder="123 Main St, Apartment 4B" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-12 rounded-xl" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">City*</label>
                    <Input required placeholder="Bangalore" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Country*</label>
                    <Select selectedKey={formData.country} onSelectionChange={(k) => setFormData({...formData, country: k?.toString()||"India"})}>
                      <SelectTrigger className="w-full h-12 rounded-xl px-3 flex items-center justify-between">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Côte d'Ivoire","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus","Czechia (Czech Republic)","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini (fmr. Swaziland)","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Holy See","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar (formerly Burma)","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine State","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"].map(c => (
                          <SelectItem key={c} id={c} textValue={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Zip Code*</label>
                    <Input required placeholder="560021" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="h-12 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Description*</label>
                  <textarea 
                    required 
                    placeholder="Enter a description..." 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full flex min-h-[100px] w-full rounded-xl border border-input bg-transparent px-3 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors"
                  />
                </div>

                <div className="pt-6">
                  <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">Shipping Method</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label 
                      className={`relative flex items-center justify-between p-4 cursor-pointer rounded-xl border-2 transition-all ${shippingMethod === 'free' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-muted/20'}`}
                      onClick={() => setShippingMethod('free')}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${shippingMethod === 'free' ? 'border-[5px] border-primary bg-background' : 'border-input bg-background'}`} />
                        <div>
                          <div className="font-bold text-[15px]">Free Shipping</div>
                          <div className="text-xs text-muted-foreground mt-0.5">7-20 Days</div>
                        </div>
                      </div>
                      <div className="font-bold text-lg">$0</div>
                    </label>

                    <label 
                      className={`relative flex items-center justify-between p-4 cursor-pointer rounded-xl border-2 transition-all ${shippingMethod === 'express' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-muted/20'}`}
                      onClick={() => setShippingMethod('express')}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${shippingMethod === 'express' ? 'border-[5px] border-primary bg-background' : 'border-input bg-background'}`} />
                        <div>
                          <div className="font-bold text-[15px]">Express Shipping</div>
                          <div className="text-xs text-muted-foreground mt-0.5">1-3 Days</div>
                        </div>
                      </div>
                      <div className="font-bold text-lg">$9</div>
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24">
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Your Cart</h2>
              
              <div className="space-y-5 mb-8">
                {cart.map((item) => (
                  <div key={item.product._id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 rounded-xl overflow-visible shrink-0 bg-muted border border-border">
                      <Image src={item.product.imageUrl || "https://via.placeholder.com/64"} alt={item.product.name} width={64} height={64} className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute -top-2 -right-2 min-w-[22px] h-[22px] bg-foreground text-background text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-background z-10 shadow-sm px-1">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-bold text-[15px] leading-tight mb-0.5 truncate">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.product.category || "Item"}</div>
                    </div>
                    <div className="font-bold text-[15px] shrink-0">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="relative flex mb-8">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground">
                  <Percent className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="Discount code" 
                  className="w-full h-12 pl-10 pr-24 rounded-xl border border-input bg-muted/10 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                />
                <Button variant="ghost" className="absolute right-1 top-1 bottom-1 h-10 font-bold hover:bg-muted cursor-pointer rounded-lg">
                  Apply
                </Button>
              </div>

              <div className="space-y-3.5 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="text-foreground font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Shipping</span>
                  <span className="text-foreground font-bold">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 font-medium">
                    Estimated taxes <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-foreground font-bold">${estimatedTaxes.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between font-black text-2xl text-foreground mb-8">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={placingOrder}
                className="w-full bg-foreground text-background py-4 rounded-xl hover:bg-foreground/90 font-bold transition-all disabled:opacity-50 text-[15px] shadow-lg cursor-pointer"
              >
                {placingOrder ? "Processing..." : "Continue to Payment"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}