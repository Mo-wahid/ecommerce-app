"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AddToCartProps {
  productId: string;
  stock: number;
}

export default function AddToCartSection({ productId, stock }: AddToCartProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Grab the logged-in user from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please log in to add items to your cart.");
      router.push("/login");
      return;
    }

    setLoading(true);

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

      alert("Item added to cart successfully!");
      // Optionally redirect to the cart page immediately
      // router.push("/cart"); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (stock === 0) {
    return (
      <button disabled className="w-full bg-gray-400 text-white py-3 rounded-md font-bold cursor-not-allowed">
        Out of Stock
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="text-gray-700 font-medium">Quantity:</label>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-1 text-gray-900 font-medium border-x border-gray-300">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            disabled={quantity >= stock}
          >
            +
          </button>
        </div>
        <span className="text-sm text-gray-500">({stock} available)</span>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-bold transition-colors disabled:bg-blue-400"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}