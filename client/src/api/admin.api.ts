import { apiRequest } from "@/lib/queryClient";
import type { Category, InsertCategory, SiteSettings, UpdateSiteSettings } from "@shared/schema";

export const adminApi = {
  // Site settings
  getSiteSettings: async (): Promise<SiteSettings> => {
    const res = await fetch("/api/public/settings");
    if (!res.ok) throw new Error("Failed to fetch site settings");
    return res.json();
  },

  updateSiteSettings: async (settings: UpdateSiteSettings): Promise<SiteSettings> => {
    const res = await apiRequest("PUT", "/api/admin/site", settings);
    return res.json();
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  },

  getCategory: async (id: string): Promise<Category> => {
    const res = await fetch(`/api/categories/${id}`);
    if (!res.ok) throw new Error("Failed to fetch category");
    return res.json();
  },

  createCategory: async (categoryData: InsertCategory): Promise<Category> => {
    const res = await apiRequest("POST", "/api/admin/categories", categoryData);
    return res.json();
  },

  updateCategory: async (id: string, categoryData: InsertCategory): Promise<Category> => {
    const res = await apiRequest("PUT", `/api/admin/categories/${id}`, categoryData);
    return res.json();
  },

  deleteCategory: async (id: string): Promise<void> => {
    const res = await apiRequest("DELETE", `/api/admin/categories/${id}`);
    if (!res.ok) throw new Error("Failed to delete category");
  },
};
