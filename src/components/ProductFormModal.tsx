"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Electronics", "Clothing", "Books", "Home & Garden", "Toys", "Sports & Outdoors", "Beauty & Personal Care", "Automotive"
  ]);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((result) => {
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            setCategoriesList(result.data.map((c: { name: string }) => c.name));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    reset,
    control,
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
          price: "" as unknown as number,
          stock: 0,
          category: "Electronics",
          isFeatured: false,
        });
      }
      setImageFile(null);
    }
  }, [isOpen, isEditing, product, reset]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

  const onSubmit = async (data: ProductFormOutput) => {
    setLoading(true);
    let finalImageUrl = isEditing ? product?.imageUrl : "";
    const loadingToastId = isEditing ? undefined : toast.loading("Uploading image...");

    try {
      if (imageFile) {
        const uploadJson = await apiClient.uploadImage(imageFile);
        finalImageUrl = uploadJson.url;
      }

      if (!isEditing) {
        toast.loading("Saving product details...", { id: loadingToastId });
      }

      const payload = {
        ...data,
        imageUrl: finalImageUrl,
      };

      if (isEditing && product) {
        await apiClient.updateProduct(product._id, payload);
      } else {
        await apiClient.createProduct(payload);
      }

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

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()} isDismissable={!loading} className="sm:max-w-4xl p-0 overflow-hidden">
      <div className="flex flex-col max-h-[95vh]">
        <DialogHeader className="p-5 pb-3 border-b shrink-0 bg-background">
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of your existing product." : "Fill in the details to create a new product in your store."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Basic Details */}
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight border-b pb-2 mb-4">Basic Information</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name</label>
                    <Input
                      {...register("name")}
                      placeholder="e.g. Wireless Headphones"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="text-destructive text-xs font-medium">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      {...register("description")}
                      rows={4}
                      placeholder="Provide a detailed description..."
                      aria-invalid={!!errors.description}
                    />
                    {errors.description && <p className="text-destructive text-xs font-medium">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        onWheel={(e) => e.currentTarget.blur()}
                        {...register("price")}
                        placeholder="0.00"
                        aria-invalid={!!errors.price}
                      />
                      {errors.price && <p className="text-destructive text-xs font-medium">{errors.price.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stock Quantity</label>
                      <Input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        {...register("stock")}
                        placeholder="0"
                        aria-invalid={!!errors.stock}
                      />
                      {errors.stock && <p className="text-destructive text-xs font-medium">{errors.stock.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <Select aria-label="Category" selectedKey={field.value} onSelectionChange={(key) => field.onChange(key?.toString() || "")}>
                            <SelectTrigger className="w-full" aria-invalid={!!errors.category}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriesList.map((cat) => (
                                <SelectItem key={cat} id={cat} textValue={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.category && <p className="text-destructive text-xs font-medium">{errors.category.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Featured Product</label>
                      <div className="flex items-center h-10">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <Controller
                            name="isFeatured"
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                isSelected={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                          <span className="text-xs text-muted-foreground">Display prominently on the home page.</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Media & Organization */}
              <div className="md:col-span-1">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight border-b pb-2 mb-4">Product Image</h3>
                  
                  {isEditing && product?.imageUrl && !imageFile && (
                    <div className="mb-4 relative group rounded-xl overflow-hidden border">
                      <Image src={product.imageUrl} alt="Current" width={300} height={300} className="w-full aspect-square object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Current Image</span>
                      </div>
                    </div>
                  )}

                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex justify-center px-4 py-6 border-2 border-dashed rounded-xl transition-colors ${
                      isDragging ? "border-primary bg-primary/10" :
                      imageFile ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="space-y-2 text-center">
                      <UploadCloud className={`mx-auto h-10 w-10 ${imageFile ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex flex-col text-sm text-muted-foreground justify-center items-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
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
                        <p className="text-xs font-semibold text-primary mt-2 truncate max-w-[200px] mx-auto">
                          {imageFile.name}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
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
        <div className="shrink-0 bg-background mt-auto">
          <Separator />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-6">
            <Button
              variant="outline"
              onPress={onClose}
              isDisabled={loading}
              className="w-full sm:w-auto px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="product-form"
              isDisabled={loading}
              className="w-full sm:w-auto px-6 shadow-md shadow-primary/20"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Saving..." : (isEditing ? "Save Changes" : "Create Product")}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}