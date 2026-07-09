import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Loader2, UploadCloud, X } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(3, "Product name is required (min 3 characters)"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  category: z.string().min(1, "Please select a category"),
  isFeatured: z.boolean().default(false),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormOutput = z.output<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: import("@/types").IProduct | null;
}

export default function ProductFormModal({ isOpen, onClose, onSuccess, product }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: "Electronics",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && product) {
        reset({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          isFeatured: product.isFeatured || false,
        });
      } else {
        reset({
          name: "",
          description: "",
          price: 0,
          stock: 0,
          category: "Electronics",
          isFeatured: false,
        });
      }
      setImageFile(null);
    }
  }, [isOpen, isEditing, product, reset]);

  const onSubmit = async (data: ProductFormOutput) => {
    if (!isEditing && !imageFile) {
      toast.error("Please select an image for the product.");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading(isEditing ? "Updating product..." : "Uploading image...");

    try {
      let finalImageUrl = product?.imageUrl || "";

      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        
        if (!uploadRes.ok) throw new Error(uploadJson.message || "Image upload failed");
        
        finalImageUrl = uploadJson.url;
      }

      if (!isEditing) {
        toast.loading("Saving product details...", { id: loadingToastId });
      }

      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/products/${product?._id}` : "/api/products";

      const productRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          imageUrl: finalImageUrl,
        }),
      });

      const productJson = await productRes.json();
      if (!productRes.ok) throw new Error(productJson.message || "Failed to save product");

      toast.success(isEditing ? "Product updated successfully!" : "Product added successfully!", { id: loadingToastId });
      
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Name</label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full px-4 py-2.5 text-slate-900 dark:text-slate-100 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none ${
                    errors.name ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50"
                  }`}
                  placeholder="e.g. Wireless Headphones"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className={`w-full px-4 py-2.5 text-slate-900 dark:text-slate-100 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none ${
                    errors.description ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50"
                  }`}
                  placeholder="Detailed description of the product..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  onWheel={(e) => e.currentTarget.blur()}
                  {...register("price")}
                  className={`w-full px-4 py-2.5 text-slate-900 dark:text-slate-100 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none ${
                    errors.price ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50"
                  }`}
                  placeholder="99.99"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1.5">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Stock Quantity</label>
                <input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}
                  {...register("stock")}
                  className={`w-full px-4 py-2.5 text-slate-900 dark:text-slate-100 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none ${
                    errors.stock ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50"
                  }`}
                  placeholder="100"
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1.5">{errors.stock.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                <select
                  {...register("category")}
                  className={`w-full px-4 py-2.5 text-slate-900 dark:text-slate-100 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none cursor-pointer ${
                    errors.category ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50"
                  }`}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Toys">Toys</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1.5">{errors.category.message}</p>}
              </div>

              <div className="md:col-span-2 flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="isFeatured"
                  {...register("isFeatured")}
                  className="w-5 h-5 text-brand-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-brand-500"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Feature this product on the home page
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Image</label>
                
                {isEditing && product?.imageUrl && !imageFile && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Current Image:</p>
                    <img src={product.imageUrl} alt="Current" className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  </div>
                )}

                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-transparent rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500"
                      >
                        <span>{isEditing ? "Upload a new image" : "Upload a file"}</span>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setImageFile(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {isEditing ? "Leave blank to keep existing image" : "PNG, JPG, GIF up to 10MB"}
                    </p>
                    {imageFile && (
                      <p className="text-sm font-semibold text-emerald-600 mt-2">
                        Selected: {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-700 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors disabled:bg-brand-400 shadow-md shadow-brand-600/20 min-w-[140px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? "Save Changes" : "Add Product")}
          </button>
        </div>

      </div>
    </div>
  );
}
