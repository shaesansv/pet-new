import { apiRequest } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";

export const productsApi = {
  // Public endpoints
  getProducts: async (filters?: { categoryId?: string; type?: string; species?: string }): Promise<Product[]> => {
    const searchParams = new URLSearchParams();
    if (filters?.categoryId) searchParams.set("categoryId", filters.categoryId);
    if (filters?.type) searchParams.set("type", filters.type);
    if (filters?.species) searchParams.set("species", filters.species);
    
    const url = `/api/products${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  },

  // Admin endpoints
  createProduct: async (productData: InsertProduct, images?: FileList): Promise<Product> => {
    const formData = new FormData();
    formData.append("productData", JSON.stringify(productData));
    
    if (images) {
      Array.from(images).forEach(file => {
        formData.append("images", file);
      });
    }

    const res = await fetch("/api/admin/products", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },

  updateProduct: async (id: string, productData: Partial<InsertProduct>, images?: FileList): Promise<Product> => {
    const formData = new FormData();
    formData.append("productData", JSON.stringify(productData));
    
    if (images) {
      Array.from(images).forEach(file => {
        formData.append("images", file);
      });
    }

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });
    
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await apiRequest("DELETE", `/api/admin/products/${id}`);
    if (!res.ok) throw new Error("Failed to delete product");
  },
};
