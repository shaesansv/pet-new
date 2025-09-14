import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Order } from "@shared/schema";

export default function OrdersManagement() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update order status", description: error.message, variant: "destructive" });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">Order Management</h2>
        <p className="text-muted-foreground">Monitor and manage customer orders</p>
      </div>

      <Card className="forest-card">
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders?.length === 0 ? (
            <div className="text-center py-8" data-testid="text-no-orders">
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Order ID</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order.id} className="border-b border-border" data-testid={`row-order-${order.id}`}>
                      <td className="py-3 px-4" data-testid={`text-order-id-${order.id}`}>
                        #{order.id.slice(-8)}
                      </td>
                      <td className="py-3 px-4" data-testid={`text-customer-name-${order.id}`}>
                        {order.customer.name}
                      </td>
                      <td className="py-3 px-4" data-testid={`text-order-total-${order.id}`}>
                        {formatPrice(order.totalAmountINR)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4" data-testid={`text-order-date-${order.id}`}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            data-testid={`button-view-order-${order.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusUpdate(order.id, value)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="w-32" data-testid={`select-status-${order.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto forest-card" data-testid="modal-order-detail">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details - #{selectedOrder.id.slice(-8)}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>
                      <span className="ml-2" data-testid="text-detail-customer-name">{selectedOrder.customer.name}</span>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2" data-testid="text-detail-customer-phone">{selectedOrder.customer.phone}</span>
                    </div>
                    {selectedOrder.customer.altPhone && (
                      <div>
                        <span className="font-medium">Alt Phone:</span>
                        <span className="ml-2" data-testid="text-detail-customer-alt-phone">{selectedOrder.customer.altPhone}</span>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <span className="font-medium">Address:</span>
                      <span className="ml-2" data-testid="text-detail-customer-address">{selectedOrder.customer.address}</span>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Products</h3>
                  <div className="space-y-3">
                    {selectedOrder.products.map((product, index) => (
                      <div key={index} className="forest-card p-4 rounded-lg" data-testid={`item-order-product-${index}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium" data-testid={`text-product-name-${index}`}>{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: <span data-testid={`text-product-quantity-${index}`}>{product.quantity}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium" data-testid={`text-product-total-${index}`}>
                              {formatPrice(product.priceInINR * product.quantity)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(product.priceInINR)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-accent" data-testid="text-detail-total">
                      {formatPrice(selectedOrder.totalAmountINR)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                    <span>Order Date:</span>
                    <span data-testid="text-detail-date">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span>Status:</span>
                    <Badge className={getStatusColor(selectedOrder.status)} data-testid="badge-detail-status">
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
