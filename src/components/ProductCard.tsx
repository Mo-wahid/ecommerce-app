"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

interface ProductProps {
  product: {
    _id: string;
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductProps) {
  return (
    <Link href={`/products/${product._id}`} className="block h-full group cursor-pointer">
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
        <div className="h-56 w-full relative overflow-hidden bg-muted">
          <Image
            src={product.imageUrl || "https://via.placeholder.com/400?text=No+Image"}
            alt={product.name}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.stock === 0 && (
            <div className="absolute top-3 right-3 bg-destructive/90 backdrop-blur-sm text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Out of Stock
            </div>
          )}
        </div>
        
        <CardContent className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2 gap-4">
            <h3 className="text-lg font-bold line-clamp-2 leading-tight">{product.name}</h3>
            <span className="text-xl font-black text-primary shrink-0">${product.price.toFixed(2)}</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-auto">{product.category}</p>
        </CardContent>

        <CardFooter className="px-5 pb-5 pt-0 mt-auto border-t border-border/50 bg-muted/20 flex items-center justify-between">
          <div className="pt-4 flex w-full justify-between items-center">
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-destructive'}`}></span>
              {product.stock > 0 ? `${product.stock} left` : 'Sold Out'}
            </span>
            <span className={buttonVariants({ variant: "default" })}>
              Details
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}