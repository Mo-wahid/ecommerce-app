"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import ProductFilterBar from "./ProductFilterBar";
import { apiClient } from "@/lib/api-client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 8;

export default function ProductCatalog({ 
  initialProducts, 
  initialTotalPages = 1 
}: { 
  initialProducts: import("@/types").IProduct[], 
  initialTotalPages?: number 
}) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Fetch categories once on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setCategories(["All", ...result.data.map((c: any) => c.name)]);
        }
      })
      .catch(() => {});
  }, []);

  // Sync category from URL if present
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    if (!isInitialMount) {
      setCurrentPage(1);
    }
  }, [searchQuery, selectedCategory, sortOrder]);

  // Fetch products when filters or page change
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return; // Skip fetching on first mount since we have initialProducts
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getProducts({
          search: searchQuery,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          sort: sortOrder,
          page: currentPage,
          limit: ITEMS_PER_PAGE
        });
        setProducts(response.data);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce for search
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortOrder, currentPage, isInitialMount]);

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
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        showSortFilter={true}
      />

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <ProductCard key={product._id} product={product} priority={index < 4} />
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