"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ICategory } from "@/types";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: ICategory | null;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: CategoryFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && category) {
        reset({
          name: category.name,
          description: category.description || "",
        });
        setImagePreview(category.image || "");
      } else {
        reset({
          name: "",
          description: "",
        });
        setImagePreview("");
      }
      setImageFile(null);
    }
  }, [isOpen, isEditing, category, reset]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    setLoading(true);
    try {
      let imageUrl = imagePreview;

      // Upload image file if selected
      if (imageFile) {
        const uploadData = await apiClient.uploadImage(imageFile);
        imageUrl = uploadData.url;
      }

      const payload = {
        name: data.name.trim(),
        description: data.description || "",
        image: imageUrl,
      };

      if (isEditing && category) {
        await apiClient.updateCategory(category._id, payload);
      } else {
        await apiClient.createCategory(payload);
      }

      toast.success(isEditing ? "Category updated successfully!" : "Category created successfully!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()} isDismissable={!loading} className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Category" : "Add New Category"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the details for this product category."
            : "Create a new category to organize products."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 sm:max-w-[500px]">
        {/* Name Field */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Category Name</label>
          <Input
            placeholder="e.g. Electronics, Footwear"
            {...register("name")}
            disabled={loading}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Description (Optional)</label>
          <Textarea
            placeholder="Short description of this category..."
            rows={3}
            {...register("description")}
            disabled={loading}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Image Upload Field */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Category Banner / Image</label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-md overflow-hidden group">
                <Image
                  src={imagePreview}
                  alt="Category preview"
                  fill
                  className="object-cover"
                  sizes="500px"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-2">
                <UploadCloud className="w-8 h-8 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </div>
                <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isDisabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
