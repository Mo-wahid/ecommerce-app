"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import SearchBar from "./ui/SearchBar";
import SelectFilter from "./ui/SelectFilter";

export default function ProductCatalog({ initialProducts }: { initialProducts: import("@/types").IProduct[] }) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

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

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex-1">
          <SearchBar
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:w-auto">
          <SelectFilter
            className="sm:w-48"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categories.map(cat => ({
              label: cat === "All" ? "All Categories" : cat,
              value: cat
            }))}
          />
          
          <SelectFilter
            className="sm:w-48"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            options={[
              { label: "All Prices", value: "All" },
              { label: "Under $50", value: "Under $50" },
              { label: "$50 to $100", value: "$50 to $100" },
              { label: "Over $100", value: "Over $100" }
            ]}
          />
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 transition-colors">
          <p className="text-gray-500 dark:text-slate-400 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}