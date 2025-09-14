import { apiRequest } from "@/lib/queryClient";
import type { Order, InsertOrder } from "@shared/schema";

export const ordersApi = {
  // Public endpoints
  createOrder: async (orderData: InsertOrder): Promise<Order> => {
    const res = await apiRequest("POST", "/api/orders", orderData);
    return res.json();
  },

  // Admin endpoints
  getOrders: async (): Promise<Order[]> => {
    const res = await fetch("/api/admin/orders", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },

  getOrder: async (id: string): Promise<Order> => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
  },

  updateOrderStatus: async (id: string, status: "pending" | "completed" | "cancelled"): Promise<Order> => {
    const res = await apiRequest("PUT", `/api/admin/orders/${id}/status`, { status });
    return res.json();
  },
};
