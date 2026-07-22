"use client";

import React from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface ProductFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  priceRange?: string;
  onPriceRangeChange?: (priceRange: string) => void;
  showPriceFilter?: boolean;
  className?: string;
}

export default function ProductFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  priceRange,
  onPriceRangeChange,
  showPriceFilter = false,
  className = "",
}: ProductFilterBarProps) {
  return (
    <Card className={`p-3 bg-card border-border shadow-sm ${className}`}>
      <div className="flex flex-col md:flex-row items-center gap-3 w-full">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          {/* Category Filter */}
          <Select
            aria-label="Filter by category"
            selectedKey={selectedCategory}
            onSelectionChange={(key) => onCategoryChange(key?.toString() || "All")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => {
                const label = cat === "All" || cat === "All Categories" ? "All Categories" : cat;
                const value = cat === "All Categories" ? "All" : cat;
                return (
                  <SelectItem key={cat} id={value} textValue={label}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Price Range Filter (Optional) */}
          {showPriceFilter && onPriceRangeChange && (
            <Select
              aria-label="Filter by price range"
              selectedKey={priceRange || "All"}
              onSelectionChange={(key) => onPriceRangeChange(key?.toString() || "All")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem id="All" textValue="All Prices">All Prices</SelectItem>
                <SelectItem id="Under $50" textValue="Under $50">Under $50</SelectItem>
                <SelectItem id="$50 to $100" textValue="$50 to $100">$50 to $100</SelectItem>
                <SelectItem id="Over $100" textValue="Over $100">Over $100</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </Card>
  );
}
