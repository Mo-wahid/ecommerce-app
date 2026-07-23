/**
 * Centralized API client layer to decouple network fetching logic from UI components.
 */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || data.error || "An error occurred during the request", response.status);
  }

  return data;
}

export const apiClient = {
  // Cart API
  getCart: (userId: string) => request<{ success: boolean; data: any }>(`/api/cart?userId=${userId}`),
  addToCart: (userId: string, productId: string, quantity: number) =>
    request<{ success: boolean; data: any }>("/api/cart", {
      method: "POST",
      body: JSON.stringify({ userId, productId, quantity }),
    }),

  // Auth API
  register: (name: string, email: string, password: string) =>
    request<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  // Profile API
  updateProfile: (data: { name?: string; password?: string }) =>
    request<{ message: string; user: any }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Categories API
  createCategory: (data: { name: string; description?: string; image?: string }) =>
    request<{ success: boolean; data: any }>("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: { name?: string; description?: string; image?: string }) =>
    request<{ success: boolean; data: any }>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<{ success: boolean }>(`/api/categories/${id}`, {
      method: "DELETE",
    }),

  // Products API
  createProduct: (data: any) =>
    request<{ success: boolean; data: any }>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: any) =>
    request<{ success: boolean; data: any }>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/api/products/${id}`, {
      method: "DELETE",
    }),

  // Upload API
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.error || "Image upload failed", res.status);
    }
    return data;
  },
};
