"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Products Section Error:", error);
  }, [error]);

  return (
    <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Unable to Load Products</h2>
      <p className="text-muted-foreground max-w-md mb-8 text-sm">
        We encountered an error while fetching product data. Please try again.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
        <Link href="/products">
          <Button variant="outline" className="gap-2">
            <ShoppingBag className="w-4 h-4" /> All Products
          </Button>
        </Link>
      </div>
    </div>
  );
}
