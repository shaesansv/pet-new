import { createContext, useContext, ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/hooks/use-socket";
import type { Category, Product, Order } from "@shared/schema";

interface AppContextType {
  categories: Category[] | undefined;
  products: Product[] | undefined;
  orders: Order[] | undefined;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: categories, refetch: refetchCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products, refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders, refetch: refetchOrders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: undefined, // This will only work if user is authenticated
    retry: false,
  });

  // Handle WebSocket events for real-time updates
  useSocket({
    onCategoryCreated: () => refetchCategories(),
    onCategoryUpdated: () => refetchCategories(),
    onCategoryDeleted: () => refetchCategories(),
    onProductCreated: () => refetchProducts(),
    onProductUpdated: () => refetchProducts(),
    onProductDeleted: () => refetchProducts(),
    onOrderCreated: () => {
      refetchOrders();
      refetchProducts(); // Refresh products to update stock
    },
    onOrderUpdated: () => refetchOrders(),
    onSettingsUpdated: () => {
      // Settings are handled by individual components
    },
  });

  const isLoading = !categories && !products;

  return (
    <AppContext.Provider
      value={{
        categories,
        products,
        orders,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
