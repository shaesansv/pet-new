import { z } from "zod";

// Admin schema
export const admins = {
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["admin"]).default("admin"),
  createdAt: z.date().default(() => new Date()),
};

export const insertAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin";
  createdAt: Date;
};

// Category schema
export const categories = {
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  createdAt: z.date().default(() => new Date()),
};

export const insertCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
};

// Product schema
export const products = {
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
  type: z.enum(["pet", "food", "accessory"]),
  species: z.string().optional(),
  images: z.array(z.string()).default([]),
  description: z.string(),
  priceInINR: z.number().positive(),
  stock: z.number().min(0),
  available: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
};

export const insertProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  type: z.enum(["pet", "food", "accessory"]),
  species: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  priceInINR: z.number().positive("Price must be positive"),
  stock: z.number().min(0, "Stock cannot be negative"),
  available: z.boolean().default(true),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = {
  id: string;
  name: string;
  categoryId: string;
  type: "pet" | "food" | "accessory";
  species?: string;
  images: string[];
  description: string;
  priceInINR: number;
  stock: number;
  available: boolean;
  createdAt: Date;
};

// Order schema
export const orders = {
  id: z.string(),
  products: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    priceInINR: z.number(),
    quantity: z.number(),
  })),
  customer: z.object({
    name: z.string(),
    phone: z.string(),
    altPhone: z.string().optional(),
    address: z.string(),
  }),
  totalAmountINR: z.number(),
  status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
  createdAt: z.date().default(() => new Date()),
};

export const insertOrderSchema = z.object({
  products: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
  })).min(1, "At least one product is required"),
  customer: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    altPhone: z.string().optional(),
    address: z.string().min(1, "Address is required"),
  }),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = {
  id: string;
  products: Array<{
    productId: string;
    name: string;
    priceInINR: number;
    quantity: number;
  }>;
  customer: {
    name: string;
    phone: string;
    altPhone?: string;
    address: string;
  };
  totalAmountINR: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
};

// Site settings schema
export const siteSettings = {
  id: z.string(),
  description: z.string(),
  youtubeUrl: z.string(),
  updatedAt: z.date().default(() => new Date()),
};

export const updateSiteSettingsSchema = z.object({
  description: z.string().min(1, "Description is required"),
  youtubeUrl: z.string().url("Invalid YouTube URL").optional().default(""),
});

export type UpdateSiteSettings = z.infer<typeof updateSiteSettingsSchema>;
export type SiteSettings = {
  id: string;
  description: string;
  youtubeUrl: string;
  updatedAt: Date;
};

// Legacy User schema for auth compatibility
export const users = {
  id: z.string(),
  username: z.string(),
  password: z.string(),
};

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: string;
  username: string;
  password: string;
};
