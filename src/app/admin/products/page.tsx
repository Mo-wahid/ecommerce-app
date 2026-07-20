"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, Edit, Trash2, ArrowLeft, Plus } from "lucide-react";
import ProductFormModal from "@/components/ProductFormModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function ManageProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [products, setProducts] = useState<import("@/types").IProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
        fetchProducts();
      }
    }
  }, [status, user, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
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
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">Manage Products</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">Update or delete your store's products.</p>
        </div>
        <div className="w-full sm:w-auto">
          <button 
            onClick={openAddModal}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-brand-600/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        {products.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400">No products found.</div>
        ) : (
          <div className="w-full overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 text-xs text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-medium">Image</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700 text-sm text-gray-900 dark:text-slate-100">
                {products.map((product) => (
                  <tr 
                    key={product._id} 
                    onClick={() => router.push(`/products/${product._id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-slate-900 rounded overflow-hidden">
                        <img 
                          src={product.imageUrl || "https://via.placeholder.com/150"} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 text-gray-500 dark:text-slate-400">{product.category}</td>
                    <td className="p-4 font-bold">${product.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400" : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(product);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-full transition-colors flex items-center justify-center"
                          title="Edit Product"
                        >
                          <Edit className="w-5 h-5" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(product);
                          }}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full transition-colors flex items-center justify-center"
                          title="Delete Product"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
