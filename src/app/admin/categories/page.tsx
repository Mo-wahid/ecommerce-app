"use client";

import { useState } from "react";

import { Edit, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const DUMMY_CATEGORIES = [
  { id: 1, name: "Electronics", items: 124, image: "/images/cat_electronics.png" },
  { id: 2, name: "Clothing", items: 85, image: "/images/cat_clothing.png" },
  { id: 3, name: "Books", items: 320, image: "/images/cat_books.png" },
  { id: 4, name: "Home & Garden", items: 64, image: "/images/cat_home.png" },
  { id: 5, name: "Toys", items: 42, image: "/images/cat_toys.png" },
  { id: 6, name: "Sports & Outdoors", items: 91, image: "/images/cat_sports.png" },
  { id: 7, name: "Beauty & Personal Care", items: 110, image: "/images/cat_beauty.png" },
  { id: 8, name: "Automotive", items: 28, image: "/images/cat_auto.png" },
];

export default function CategoriesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const totalPages = Math.ceil(DUMMY_CATEGORIES.length / ITEMS_PER_PAGE);
  const displayedCategories = DUMMY_CATEGORIES.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Categories</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your store's product categories.</p>
        </div>
        <Button className="shadow-sm gap-2">
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHead isRowHeader>Category Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Total Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableHeader>
            <TableBody>
              {displayedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <span className="font-semibold">{category.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <ImageIcon className="w-4 h-4" />
                      <span className="truncate max-w-[150px]" title={category.image}>{category.image}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                      {category.items} items
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <div className="mt-auto shrink-0 bg-white dark:bg-slate-900 z-10 relative">
            <Separator />
            <div className="p-4">
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
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
