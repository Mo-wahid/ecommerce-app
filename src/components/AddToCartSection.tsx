"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/context/AuthModalContext";

interface AddToCartProps {
  productId: string;
  stock: number;
  price: number;
}

export default function AddToCartSection({ productId, stock, price }: AddToCartProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { openModal } = useAuthModal();

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      openModal("login");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Adding to cart...");

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          productId,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      const totalItemsInCart = data.data.products.reduce((sum: number, item: any) => sum + item.quantity, 0);

      toast.success(`Added to cart! You now have ${totalItemsInCart} items in your cart.`, { 
        id: toastId,
        position: 'bottom-right'
      });
      // We don't necessarily want to go back immediately as it might disrupt their browsing.
      // setTimeout(() => {
      //   router.back();
      // }, 500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, { id: toastId });
      } else {
        toast.error("An unexpected error occurred", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  if (stock === 0) {
    return (
      <button disabled className="w-full bg-slate-300 text-slate-500 py-3.5 rounded-xl font-bold cursor-not-allowed shadow-inner mt-4">
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-6 mt-6 pt-6 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <label className="text-slate-700 dark:text-slate-300 font-semibold">Quantity</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors font-medium cursor-pointer"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-4 py-2 text-slate-900 font-bold border-x border-slate-200 min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors font-medium cursor-pointer"
              disabled={quantity >= stock}
            >
              +
            </button>
          </div>
          <span className="text-sm font-medium text-slate-500">({stock - quantity} left)</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-lg font-bold text-slate-900 dark:text-slate-100">
        <span>Total Price:</span>
        <span>${(price * quantity).toFixed(2)}</span>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="cursor-pointer w-full flex justify-center items-center gap-2 bg-brand-600 text-white py-3.5 rounded-xl hover:bg-brand-700 font-bold transition-all disabled:bg-brand-400 disabled:cursor-not-allowed shadow-md shadow-brand-600/20 text-lg"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
        {loading ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}