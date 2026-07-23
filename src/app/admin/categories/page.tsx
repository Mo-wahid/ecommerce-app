"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Edit, Trash2, Plus, FolderTree, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import dynamic from "next/dynamic";

const CategoryFormModal = dynamic(() => import("@/components/CategoryFormModal"), { ssr: false });
const DeleteConfirmModal = dynamic(() => import("@/components/DeleteConfirmModal"), { ssr: false });

import { ICategory } from "@/types";

const ITEMS_PER_PAGE = 8;

export default function CategoriesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<ICategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth Protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && user?.role !== "admin") {
      router.push("/");
    }
  }, [status, user, router]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      const result = await res.json();
      if (res.ok && result.success) {
        setCategories(result.data || []);
      } else {
        toast.error(result.message || "Failed to load categories.");
      }
    } catch (error) {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && user?.role === "admin") {
      fetchCategories();
    }
  }, [status, user]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filtered & Paginated Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [categories, searchQuery]);

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const displayedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  // Handle Create / Edit Open
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (category: ICategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  // Handle Delete
  const handleOpenDeleteModal = (category: ICategory) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deletingCategory._id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success("Category deleted successfully.");
        fetchCategories();
      } else {
        toast.error(result.message || "Failed to delete category.");
      }
    } catch (error) {
      toast.error("Failed to delete category.");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingCategory(null);
    }
  };

  if (status === "loading" || (loading && categories.length === 0)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage your store's product categories.</p>
        </div>
        <Button onPress={handleOpenAddModal} className="shadow-sm gap-2">
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-3 bg-card border-border shadow-sm">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Search categories..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Categories Table / Empty State */}
      <Card className="overflow-hidden border-border bg-card">
        {filteredCategories.length === 0 ? (
          <CardContent className="p-6">
            <EmptyState
              icon={FolderTree}
              title="No categories found"
              description={
                searchQuery
                  ? "No categories match your search criteria. Try a different query."
                  : "You haven't created any categories yet. Add your first category to get started."
              }
              action={
                <Button onPress={handleOpenAddModal} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              }
            />
          </CardContent>
        ) : (
          <>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableHead isRowHeader>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableHeader>
                <TableBody>
                  {displayedCategories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {category.image ? (
                            <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 border border-border bg-muted">
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border text-muted-foreground font-bold">
                              {category.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-foreground">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[250px]">
                          {category.description || "No description"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                          {category.itemCount || 0} products
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onPress={() => handleOpenEditModal(category)}
                            aria-label={`Edit ${category.name}`}
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onPress={() => handleOpenDeleteModal(category)}
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>

            {totalPages > 1 && (
              <div className="bg-card z-10 relative">
                <Separator />
                <div className="p-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                          onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Category Form Modal (Create & Edit) */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchCategories}
        category={editingCategory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        itemName={deletingCategory?.name || "this category"}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
