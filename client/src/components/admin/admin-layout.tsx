import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Tags, 
  LogOut,
  Menu 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import ProductsManagement from "./products-management";
import OrdersManagement from "./orders-management";
import CategoriesManagement from "./categories-management";
import AdminHome from "./admin-home";

type AdminPage = "dashboard" | "products" | "orders" | "categories";

export default function AdminLayout() {
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Tags },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <AdminHome />;
      case "products":
        return <ProductsManagement />;
      case "orders":
        return <OrdersManagement />;
      case "categories":
        return <CategoriesManagement />;
      default:
        return <AdminHome />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile header */}
        <div className="lg:hidden border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-serif font-bold text-accent">🌲 Admin</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`lg:w-64 border-r border-border ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="p-6">
            <h1 className="hidden lg:block text-xl font-serif font-bold text-accent mb-6">
              🌲 PetShopForest Admin
            </h1>
            
            {/* User info */}
            <div className="flex items-center space-x-3 mb-6 p-3 forest-card rounded-lg">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.username?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold" data-testid="text-admin-username">
                  {user?.username || "Admin"}
                </h3>
                <p className="text-sm text-muted-foreground">Administrator</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentPage(item.id as AdminPage);
                      setSidebarOpen(false);
                    }}
                    data-testid={`nav-${item.id}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
