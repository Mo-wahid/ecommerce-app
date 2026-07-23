"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/context/AuthModalContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";

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
      const data = await apiClient.addToCart(user.id, productId, quantity);

      const totalItemsInCart = data.data.products.reduce((sum: number, item: any) => sum + item.quantity, 0);

      toast.success(`Added to cart! You now have ${totalItemsInCart} items in your cart.`, { 
        id: toastId,
        action: {
          label: "View Cart",
          onClick: () => router.push('/cart')
        }
      });
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
      <Button isDisabled className="w-full h-12 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-xl cursor-not-allowed">
        Out of Stock
      </Button>
    );
  }

  return (
    <>
      <div className="bg-muted/40 p-5 md:p-6 rounded-2xl border border-border/50 space-y-6 mt-2">
        <div className="flex items-center justify-between">
          <label className="text-foreground font-semibold">Quantity</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-lg overflow-hidden shadow-sm bg-card">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-foreground hover:bg-muted disabled:opacity-50 transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-2 text-foreground font-bold border-x border-border min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="px-4 py-2 text-foreground hover:bg-muted disabled:opacity-50 transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
                disabled={quantity >= stock}
              >
                +
              </button>
            </div>
            <span className="text-sm font-medium text-muted-foreground">({stock - quantity} left)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-lg font-bold text-foreground">
          <span>Total Price:</span>
          <span>${(price * quantity).toFixed(2)}</span>
        </div>

        <Button
          onPress={handleAddToCart}
          isDisabled={loading}
          className="w-full h-11 text-lg"
          size="lg"
        >
          {!loading && <ShoppingCart className="w-5 h-5 mr-2" />}
          {loading ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </>
  );
}