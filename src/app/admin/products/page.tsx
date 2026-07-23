"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Edit, Trash2, ArrowLeft, Plus, Package } from "lucide-react";
import dynamic from "next/dynamic";

const ProductFormModal = dynamic(() => import("@/components/ProductFormModal"), { ssr: false });
const DeleteConfirmModal = dynamic(() => import("@/components/DeleteConfirmModal"), { ssr: false });

import ProductFilterBar from "@/components/ProductFilterBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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

export default function ManageProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [products, setProducts] = useState<import("@/types").IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All Categories",
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Toys",
    "Sports & Outdoors",
    "Beauty & Personal Care",
    "Automotive"
  ];

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<import("@/types").IProduct | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; product: import("@/types").IProduct | null; isDeleting: boolean }>({
    isOpen: false,
    product: null,
    isDeleting: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && user) {
      if (user.role !== "admin") {
        router.push("/");
      } else {
        const debounceTimer = setTimeout(() => {
          fetchProducts();
        }, 300); // 300ms debounce
        
        return () => clearTimeout(debounceTimer);
      }
    }
  }, [status, user, router, searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "All" && selectedCategory !== "All Categories") {
        params.append("category", selectedCategory);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setProducts(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (product: import("@/types").IProduct) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const confirmDelete = (product: import("@/types").IProduct) => {
    setDeleteModalState({ isOpen: true, product, isDeleting: false });
  };

  const handleDelete = async () => {
    const product = deleteModalState.product;
    if (!product) return;

    setDeleteModalState(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted successfully");
      setProducts(products.filter((p) => p._id !== product._id));
      setDeleteModalState({ isOpen: false, product: null, isDeleting: false });
    } catch (error) {
      console.error(error);
      toast.error("Error deleting product");
      setDeleteModalState(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const displayedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manage Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">Update or delete your store's products.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Button 
            onPress={openAddModal}
            className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </Button>
        </div>
      </div>

      <ProductFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(val) => {
          setSelectedCategory(val);
          setCurrentPage(1);
        }}
        categories={categories}
        showPriceFilter={false}
      />

      <Card className="overflow-hidden border-border bg-card">
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search or filter to find what you're looking for, or add a new product."
            className="border-0 rounded-none shadow-none bg-transparent"
            action={
              <Button onPress={openAddModal}>Add New Product</Button>
            }
          />
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="sm:hidden divide-y divide-border">
              {displayedProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => {
                    setNavigatingId(product._id as string);
                    router.push(`/products/${product._id}`);
                  }}
                  className={`flex items-center gap-3 p-4 transition-colors ${navigatingId === product._id ? "cursor-wait opacity-75 bg-muted" : "cursor-pointer hover:bg-muted/50"}`}
                >
                  <div className="w-14 h-14 bg-muted border border-border rounded-lg overflow-hidden shrink-0">
                    <img
                      src={product.imageUrl || "https://via.placeholder.com/150"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-bold text-foreground">${product.price.toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={(e: any) => { e.stopPropagation(); openEditModal(product); }}
                      className="text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={(e: any) => { e.stopPropagation(); confirmDelete(product); }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (hidden on mobile, visible on sm and up) */}
            <div className="hidden sm:block overflow-x-auto border border-border rounded-xl bg-card">
              <Table>
                <TableHeader>
                  <TableHead className="w-16" isRowHeader>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <TableBody>
                  {displayedProducts.map((product) => (
                    <TableRow 
                      key={product._id} 
                      onAction={() => {
                        setNavigatingId(product._id as string);
                        router.push(`/products/${product._id}`);
                      }}
                      className={navigatingId === product._id ? "cursor-wait opacity-75" : "cursor-pointer"}
                    >
                      <TableCell>
                        <div className="w-12 h-12 bg-muted border border-border rounded overflow-hidden relative">
                          <Image
                            src={product.imageUrl || "https://via.placeholder.com/150"}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.category}</TableCell>
                      <TableCell className="font-bold text-foreground">${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                          {product.stock} in stock
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onPress={() => openEditModal(product)}
                            className="text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onPress={() => confirmDelete(product)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="bg-card">
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
          </>
        )}
      </Card>

      {/* Modals */}

      <ProductFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchProducts}
        product={editingProduct}
      />

      <DeleteConfirmModal 
        isOpen={deleteModalState.isOpen}
        itemName={deleteModalState.product?.name || ""}
        isDeleting={deleteModalState.isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, product: null, isDeleting: false })}
      />
    </div>
  );
}
