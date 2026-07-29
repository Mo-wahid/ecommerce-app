"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronRight, ShoppingCart, Percent, AlertCircle, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ── Zod Schema ──────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required").min(2, "Must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required").min(2, "Must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+]?[\d\s\-().]{7,20}$/, "Please enter a valid phone number"),
  address: z.string().min(1, "Address is required").min(5, "Please enter a full address"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  zip: z
    .string()
    .min(1, "Zip code is required")
    .regex(/^[\w\s\-]{3,10}$/, "Please enter a valid zip code"),
  country: z.string().min(1, "Country is required"),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ── Helper: field wrapper with error display ────────────────────────────────
function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
        {optional && (
          <span className="text-muted-foreground/60 normal-case font-normal ml-1">(optional)</span>
        )}
      </label>
      {children}
      {error && <p className="text-xs text-destructive font-medium mt-1">{error}</p>}
    </div>
  );
}

// ── Countries list ──────────────────────────────────────────────────────────
const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "India",
  "Germany", "France", "Japan", "Brazil", "Mexico", "Italy", "Spain",
  "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Switzerland",
  "Austria", "Belgium", "Ireland", "New Zealand", "Singapore", "South Korea",
  "South Africa", "Argentina", "Chile", "Colombia", "Egypt", "Nigeria",
  "Pakistan", "Bangladesh", "Indonesia", "Philippines", "Thailand", "Vietnam",
  "Malaysia", "Turkey", "Saudi Arabia", "United Arab Emirates", "Qatar",
  "Kuwait", "Poland", "Portugal", "Greece", "Czech Republic", "Romania",
  "Hungary", "Israel", "Ukraine", "China", "Russia",
];

// ── Shared input classes ────────────────────────────────────────────────────
const inputClass =
  "flex h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
const inputErrorClass =
  "flex h-11 w-full rounded-lg border border-destructive bg-transparent px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [cart, setCart] = useState<import("@/types").ICartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [serverError, setServerError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");

  const [shippingMethod, setShippingMethod] = useState<"free" | "express">("free");
  const shippingCost = shippingMethod === "express" ? 9 : 0;
  const estimatedTaxes = 5.0;
  const total = subtotal + shippingCost + estimatedTaxes;

  // ── react-hook-form setup ───────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
      notes: "",
    },
  });

  // ── Auth & prefill ─────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && session?.user) {
      setValue("firstName", user?.name?.split(" ")[0] || "");
      setValue("lastName", user?.name?.split(" ").slice(1).join(" ") || "");
      setValue("email", user?.email || "");
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
      setServerError("Failed to load cart data.");
    } finally {
      setLoading(false);
    }
  };

  // ── Submit handler (runs only after Zod passes) ────────────────────────
  const onSubmit = async (_formData: CheckoutFormData) => {
    if (!user) return;
    setServerError("");
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
        body: JSON.stringify({ orderItems, totalAmount: total }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order.");

      const newOrderId = data.data._id;
      setOrderId(newOrderId);

      const intentRes = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: newOrderId }),
      });

      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.message || "Failed to initialize payment.");

      if (intentData.clientSecret) {
        setClientSecret(intentData.clientSecret);
      } else {
        throw new Error("No client secret returned");
      }
    } catch (err: any) {
      setServerError(err.message || "An unknown error occurred");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Loading / empty states ─────────────────────────────────────────────
  if (status === "loading" || loading)
    return <div className="text-center py-12">Loading checkout...</div>;

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

  // ── Render ─────────────────────────────────────────────────────────────
  const orderSummaryContent = (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <h2 className="text-lg font-bold text-foreground mb-5">Order Summary</h2>

      <div className="space-y-4 mb-6">
        {cart.map((item) => (
          <div key={item.product._id} className="flex gap-3 items-center">
            <div className="relative w-14 h-14 rounded-lg overflow-visible shrink-0 bg-muted border border-border">
              <img
                src={item.product.imageUrl || "https://via.placeholder.com/56"}
                alt={item.product.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-foreground text-background text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background z-10 px-1">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight truncate">{item.product.name}</div>
              <div className="text-xs text-muted-foreground">{item.product.category || "Item"}</div>
            </div>
            <div className="font-bold text-sm shrink-0">
              ${(item.product.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-5" />

      {/* Discount Code */}
      <div className="relative flex mb-5">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
          <Percent className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          placeholder="Discount code"
          className="w-full h-10 pl-9 pr-20 rounded-lg border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-all"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 bottom-1 h-8 px-3 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          Apply
        </Button>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-semibold">
            {shippingCost === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">Free</span>
            ) : (
              `$${shippingCost.toFixed(2)}`
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            Tax <AlertCircle className="w-3 h-3" />
          </span>
          <span className="font-semibold">${estimatedTaxes.toFixed(2)}</span>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="flex justify-between font-bold text-lg mb-6">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      {!clientSecret && (
        <Button
          type="submit"
          isDisabled={placingOrder}
          className="w-full h-12 rounded-xl text-sm font-bold shadow-lg"
        >
          <Lock className="w-3.5 h-3.5 mr-2" />
          {placingOrder ? "Processing..." : "Continue to Payment"}
        </Button>
      )}

      <p className="text-[11px] text-muted-foreground text-center mt-3">
        Secure checkout powered by Stripe
      </p>
    </div>
  );

  return (
    <div className="bg-muted/20 dark:bg-background min-h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm mb-6">
          <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-muted-foreground/50" />
          <span className="text-foreground font-semibold">Shipping</span>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-muted-foreground/50" />
          <span className="text-muted-foreground">Payment</span>
        </nav>

        {serverError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 mb-6 font-medium text-sm">
            {serverError}
          </div>
        )}

        {clientSecret ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm orderId={orderId} amount={total} />
              </Elements>
            </div>
            <div className="lg:col-span-5 lg:sticky lg:top-20">
              {orderSummaryContent}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ── Left Column ─────────────────────────────────────────── */}
              <div className="lg:col-span-7 space-y-6">
                {/* Contact Information */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-5">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="First Name" error={errors.firstName?.message}>
                        <input
                          {...register("firstName")}
                          placeholder="John"
                          className={errors.firstName ? inputErrorClass : inputClass}
                        />
                      </Field>
                      <Field label="Last Name" error={errors.lastName?.message}>
                        <input
                          {...register("lastName")}
                          placeholder="Doe"
                          className={errors.lastName ? inputErrorClass : inputClass}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Email" error={errors.email?.message}>
                        <input
                          type="email"
                          {...register("email")}
                          placeholder="john@example.com"
                          className={errors.email ? inputErrorClass : inputClass}
                        />
                      </Field>
                      <Field label="Phone" error={errors.phone?.message}>
                        <input
                          type="tel"
                          {...register("phone")}
                          placeholder="+1 (555) 123-4567"
                          className={errors.phone ? inputErrorClass : inputClass}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-5">Shipping Address</h2>
                  <div className="space-y-4">
                    <Field label="Street Address" error={errors.address?.message}>
                      <input
                        {...register("address")}
                        placeholder="123 Main St, Apartment 4B"
                        className={errors.address ? inputErrorClass : inputClass}
                      />
                    </Field>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <Field label="City" error={errors.city?.message}>
                          <input
                            {...register("city")}
                            placeholder="New York"
                            className={errors.city ? inputErrorClass : inputClass}
                          />
                        </Field>
                      </div>
                      <Field label="State" optional error={errors.state?.message}>
                        <input
                          {...register("state")}
                          placeholder="NY"
                          className={errors.state ? inputErrorClass : inputClass}
                        />
                      </Field>
                      <Field label="Zip Code" error={errors.zip?.message}>
                        <input
                          {...register("zip")}
                          placeholder="10001"
                          className={errors.zip ? inputErrorClass : inputClass}
                        />
                      </Field>
                      <Field label="Country" error={errors.country?.message}>
                        <select
                          {...register("country")}
                          className={`${errors.country ? inputErrorClass : inputClass} cursor-pointer appearance-none`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 10px center",
                          }}
                        >
                          {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label="Order Notes" optional>
                      <textarea
                        {...register("notes")}
                        placeholder="Any special instructions for delivery..."
                        rows={3}
                        className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none transition-colors"
                      />
                    </Field>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-5">Shipping Method</h2>
                  <div className="space-y-3">
                    <label
                      className={`flex items-center justify-between p-4 cursor-pointer rounded-xl border-2 transition-all ${
                        shippingMethod === "free"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                      onClick={() => setShippingMethod("free")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            shippingMethod === "free" ? "border-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {shippingMethod === "free" && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Standard Shipping</div>
                          <div className="text-xs text-muted-foreground">7–20 business days</div>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Free</span>
                    </label>

                    <label
                      className={`flex items-center justify-between p-4 cursor-pointer rounded-xl border-2 transition-all ${
                        shippingMethod === "express"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                      onClick={() => setShippingMethod("express")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            shippingMethod === "express" ? "border-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {shippingMethod === "express" && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Express Shipping</div>
                          <div className="text-xs text-muted-foreground">1–3 business days</div>
                        </div>
                      </div>
                      <span className="font-bold text-sm">$9.00</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Right Column: Order Summary ─────────────────────────── */}
              <div className="lg:col-span-5 lg:sticky lg:top-20">
                {orderSummaryContent}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function StripePaymentForm({ orderId, amount }: { orderId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order_id=${orderId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
      <h2 className="text-lg font-bold text-foreground mb-2">Payment Details</h2>
      <PaymentElement />
      {errorMessage && (
        <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
          {errorMessage}
        </div>
      )}
      <Button
        type="submit"
        isDisabled={!stripe || loading}
        className="w-full h-12 rounded-xl text-sm font-bold shadow-lg mt-6"
      >
        <Lock className="w-3.5 h-3.5 mr-2" />
        {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}