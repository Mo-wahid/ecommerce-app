"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import ProductFilterBar from "./ProductFilterBar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";

const ITEMS_PER_PAGE = 8;

export default function ProductCatalog({ initialProducts }: { initialProducts: import("@/types").IProduct[] }) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange]);

  // Extract unique categories for the dropdown filter
  const categories = useMemo(() => {
    const allCategories = initialProducts.map((p) => p.category);
    return ["All", ...Array.from(new Set(allCategories))];
  }, [initialProducts]);

  // Filter products based on search, category, and price
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      
      let matchesPrice = true;
      if (priceRange === "Under $50") matchesPrice = product.price < 50;
      else if (priceRange === "$50 to $100") matchesPrice = product.price >= 50 && product.price <= 100;
      else if (priceRange === "Over $100") matchesPrice = product.price > 100;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [initialProducts, searchQuery, selectedCategory, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* Search and Filter Controls */}
      <ProductFilterBar
        className="mb-8"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        showPriceFilter={true}
      />

      {/* Product Grid */}
      {paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {paginatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onPress={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onPress={() => setCurrentPage(i + 1)} 
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-20 flex flex-col items-center justify-center">
            <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}