import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Package, Tags, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAppContext } from "@/context/app-context";
import type { SiteSettings, UpdateSiteSettings } from "@shared/schema";

export default function AdminHome() {
  const [settingsData, setSettingsData] = useState<UpdateSiteSettings>({
    description: "",
    youtubeUrl: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { categories, products, orders } = useAppContext();

  const { data: siteSettings, isLoading: settingsLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/public/settings"],
  });

  // Set initial data when settings load
  useEffect(() => {
    if (siteSettings) {
      setSettingsData({
        description: siteSettings.description,
        youtubeUrl: siteSettings.youtubeUrl,
      });
    }
  }, [siteSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: UpdateSiteSettings) => {
      const res = await apiRequest("PUT", "/api/admin/site", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public/settings"] });
      toast({ title: "Site settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update settings", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settingsData);
  };


  const totalOrders = orders?.length || 0;
  const activeProducts = products?.filter(p => p.available && p.stock > 0).length || 0;
  const totalCategories = categories?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.totalAmountINR, 0) || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your pet shop administration panel</p>
      </div>

      {/* Site Settings */}
      <Card className="forest-card">
        <CardHeader>
          <CardTitle className="text-xl font-serif">Store Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="store-description">Store Description</Label>
              <Textarea
                id="store-description"
                placeholder="Enter store description..."
                value={settingsData.description}
                onChange={(e) => setSettingsData(prev => ({ ...prev, description: e.target.value }))}
                disabled={updateSettingsMutation.isPending || settingsLoading}
                className="h-32"
                data-testid="input-store-description"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This description will appear on your homepage.
              </p>
            </div>
            
            <div>
              <Label htmlFor="youtube-url">YouTube Video URL</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={settingsData.youtubeUrl}
                onChange={(e) => setSettingsData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                disabled={updateSettingsMutation.isPending || settingsLoading}
                data-testid="input-youtube-url"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Add a YouTube video to showcase on your homepage.
              </p>
            </div>
            
            <Button 
              type="submit" 
              disabled={updateSettingsMutation.isPending || settingsLoading}
              data-testid="button-save-settings"
            >
              {updateSettingsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="forest-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-orders">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>
        
        <Card className="forest-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-products">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">Products in stock</p>
          </CardContent>
        </Card>
        
        <Card className="forest-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-categories">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>

        <Card className="forest-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="text-accent">₹</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-revenue">
              {formatPrice(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="forest-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {orders?.length === 0 && products?.length === 0 && categories?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" data-testid="text-no-activity">
              No recent activity. Start by adding some categories and products.
            </p>
          ) : (
            <div className="space-y-3">
              {orders?.slice(0, 5).map((order, index) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0" data-testid={`item-recent-order-${index}`}>
                  <div>
                    <p className="font-medium">New order from {order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(order.totalAmountINR)} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm text-accent">#{order.id.slice(-8)}</div>
                </div>
              ))}
              {orders?.length === 0 && (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-recent-orders">
                  No recent orders.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
