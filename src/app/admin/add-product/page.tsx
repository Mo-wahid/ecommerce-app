"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Loader2, UploadCloud } from "lucide-react";
import { useSession } from "next-auth/react";

const productSchema = z.object({
  name: z.string().min(3, "Product name is required (min 3 characters)"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  category: z.string().min(1, "Please select a category"),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormOutput = z.output<typeof productSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && user?.role !== "admin") {
      router.push("/");
    }
  }, [status, user, router]);

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

  const onSubmit = async (data: ProductFormOutput) => {
    if (!imageFile) {
      toast.error("Please select an image for the product.");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Uploading image...");

    try {
      // 1. Upload the Image to Cloudinary via our API route
      const uploadData = new FormData();
      uploadData.append("file", imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadJson.message || "Image upload failed");
      }

      const imageUrl = uploadJson.url;

      toast.loading("Saving product details...", { id: loadingToastId });

      // 2. Save the Product to MongoDB with the new Cloudinary URL
      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          imageUrl,
        }),
      });

      const productJson = await productRes.json();

      if (!productRes.ok) {
        throw new Error(productJson.message || "Failed to save product");
      }

      toast.success("Product added successfully!", { id: loadingToastId });
      
      reset();
      setImageFile(null);
      
      setTimeout(() => router.push("/products"), 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-colors">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-8 tracking-tight border-b border-slate-100 dark:border-slate-700 pb-4">Add New Product</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Name</label>
              <input
                type="text"
                {...register("name")}
                className={`w-full px-4 py-2.5 text-slate-900 dark:text-slate-100 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${
                  errors.name ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                }`}
                placeholder="e.g. Wireless Headphones"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className={`w-full px-4 py-2.5 text-slate-900 dark:text-slate-100 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${
                  errors.description ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
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
                {...register("price")}
                className={`w-full px-4 py-2.5 text-slate-900 dark:text-slate-100 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${
                  errors.price ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                }`}
                placeholder="99.99"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1.5">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Stock Quantity</label>
              <input
                type="number"
                {...register("stock")}
                className={`w-full px-4 py-2.5 text-slate-900 dark:text-slate-100 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${
                  errors.stock ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                }`}
                placeholder="100"
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1.5">{errors.stock.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
              <select
                {...register("category")}
                className={`w-full px-4 py-2.5 text-slate-900 dark:text-slate-100 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all ${
                  errors.category ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-transparent rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500"
                    >
                      <span>Upload a file</span>
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
                  <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  {imageFile && (
                    <p className="text-sm font-semibold text-emerald-600 mt-2">
                      Selected: {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-brand-600 text-white py-3 px-4 rounded-xl hover:bg-brand-700 disabled:bg-brand-400 disabled:cursor-not-allowed transition-all font-bold mt-8 shadow-md shadow-brand-600/20 text-lg"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Saving Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}