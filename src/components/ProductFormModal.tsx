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
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

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
    // 1. BACKDROP: Pinned to edges, flex-end on mobile for bottom-sheet, centered on desktop
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-x-hidden">
      
      {/* 2. CONTAINER: Full height/width on mobile, rounded only on top for mobile sheet, fully rounded on desktop */}
      <div className="bg-white dark:bg-slate-900 w-full h-full sm:h-auto max-h-[100dvh] sm:max-h-[95vh] sm:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200 border-x border-t sm:border border-slate-200 dark:border-slate-800">
        
        {/* Header (Shrink-0 prevents it from squishing) */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isEditing ? "Update the details of your existing product." : "Fill in the details to create a new product in your store."}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Scrollable Form Content (flex-1 forces it to take remaining space) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              
              {/* Left Column: Basic Details */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 sm:mb-4">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Name</label>
                    <input
                      type="text"
                      {...register("name")}
                      className={`w-full px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none ${
                        errors.name ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50"
                      }`}
                      placeholder="e.g. Wireless Headphones"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      className={`w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-100 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none resize-none ${
                        errors.description ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50"
                      }`}
                      placeholder="Provide a detailed description..."
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Price ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          onWheel={(e) => e.currentTarget.blur()}
                          {...register("price")}
                          className={`w-full pl-8 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none ${
                            errors.price ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50"
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.price && <p className="text-red-500 text-xs mt-1.5">{errors.price.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Stock Quantity</label>
                      <input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        {...register("stock")}
                        className={`w-full px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none ${
                          errors.stock ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50"
                        }`}
                        placeholder="0"
                      />
                      {errors.stock && <p className="text-red-500 text-xs mt-1.5">{errors.stock.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                      <div className="relative">
                        <select
                          {...register("category")}
                          className={`w-full px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none cursor-pointer appearance-none ${
                            errors.category ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50"
                          }`}
                        >
                          <option value="Electronics">Electronics</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Books">Books</option>
                          <option value="Home & Garden">Home & Garden</option>
                          <option value="Toys">Toys</option>
                          <option value="Sports & Outdoors">Sports & Outdoors</option>
                          <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                          <option value="Automotive">Automotive</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors.category && <p className="text-red-500 text-xs mt-1.5">{errors.category.message}</p>}
                    </div>

                    <div className="flex items-center sm:pt-6">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center shrink-0">
                          <input
                            type="checkbox"
                            {...register("isFeatured")}
                            className="peer sr-only"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Featured Product</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Display prominently on the home page.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Media & Organization */}
              <div className="md:col-span-1 space-y-6">
                
                {/* Image Upload */}
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 sm:mb-4">Product Image</h3>
                  
                  {isEditing && product?.imageUrl && !imageFile && (
                    <div className="mb-4 relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={product.imageUrl} alt="Current" className="w-full aspect-square object-cover" />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Current Image</span>
                      </div>
                    </div>
                  )}

                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex justify-center px-4 py-6 sm:py-8 border-2 border-dashed rounded-xl transition-colors ${
                    isDragging ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" :
                    imageFile ? "border-brand-500 bg-brand-50/50 dark:bg-brand-900/10" : "border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}>
                    <div className="space-y-2 text-center">
                      <UploadCloud className={`mx-auto h-8 w-8 sm:h-10 sm:w-10 ${imageFile ? "text-brand-500" : "text-slate-400"}`} />
                      <div className="flex flex-col text-xs sm:text-sm text-slate-600 dark:text-slate-400 justify-center items-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-transparent rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none"
                        >
                          <span>{imageFile ? "Change image" : (isEditing ? "Upload a new image" : "Click to upload")}</span>
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
                        {!imageFile && <p className="mt-1">or drag and drop</p>}
                      </div>
                      {imageFile ? (
                        <p className="text-xs font-semibold text-brand-600 mt-2 truncate max-w-[200px] mx-auto">
                          {imageFile.name}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          {isEditing ? "Leave blank to keep existing" : "PNG, JPG up to 10MB"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </form>
        </div>

        {/* Footer actions (Pinned to bottom) */}
        <div className="flex flex-col-reverse sm:flex-row justify-end sm:items-center gap-3 p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 mt-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors disabled:bg-brand-400 shadow-md shadow-brand-600/20 disabled:cursor-wait cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? "Save Changes" : "Create Product")}
          </button>
        </div>

      </div>
    </div>
  );
}