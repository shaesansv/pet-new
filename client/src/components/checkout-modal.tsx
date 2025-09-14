import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product, InsertOrder } from "@shared/schema";

interface CheckoutModalProps {
  isOpen: boolean;
  product: Product | null;
  quantity: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ 
  isOpen, 
  product, 
  quantity, 
  onClose, 
  onSuccess 
}: CheckoutModalProps) {
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    altPhone: "",
    address: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const orderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Order placed successfully!",
        description: "We'll contact you soon with delivery details.",
      });
      setCustomerData({ name: "", phone: "", altPhone: "", address: "" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    const orderData: InsertOrder = {
      products: [
        {
          productId: product.id,
          quantity,
        },
      ],
      customer: {
        name: customerData.name,
        phone: customerData.phone,
        altPhone: customerData.altPhone || undefined,
        address: customerData.address,
      },
    };

    orderMutation.mutate(orderData);
  };

  if (!product) return null;

  const totalAmount = product.priceInINR * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md forest-card" data-testid="modal-checkout">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-serif font-bold">Checkout</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-checkout">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customer-name">Full Name *</Label>
            <Input
              id="customer-name"
              type="text"
              placeholder="Enter your full name"
              value={customerData.name}
              onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={orderMutation.isPending}
              data-testid="input-customer-name"
            />
          </div>
          
          <div>
            <Label htmlFor="customer-phone">Phone Number *</Label>
            <Input
              id="customer-phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={customerData.phone}
              onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
              required
              disabled={orderMutation.isPending}
              data-testid="input-customer-phone"
            />
          </div>
          
          <div>
            <Label htmlFor="customer-alt-phone">Alternative Phone</Label>
            <Input
              id="customer-alt-phone"
              type="tel"
              placeholder="Alternative contact"
              value={customerData.altPhone}
              onChange={(e) => setCustomerData(prev => ({ ...prev, altPhone: e.target.value }))}
              disabled={orderMutation.isPending}
              data-testid="input-customer-alt-phone"
            />
          </div>
          
          <div>
            <Label htmlFor="customer-address">Address *</Label>
            <Textarea
              id="customer-address"
              placeholder="Enter your complete address"
              value={customerData.address}
              onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
              required
              disabled={orderMutation.isPending}
              className="h-20"
              data-testid="input-customer-address"
            />
          </div>
          
          <div className="border-t border-border pt-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Product:</span>
                <span data-testid="text-checkout-product">{product.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span data-testid="text-checkout-quantity">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Unit Price:</span>
                <span data-testid="text-checkout-unit-price">{formatPrice(product.priceInINR)}</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-lg border-t border-border pt-2">
                <span>Total Amount:</span>
                <span className="text-accent" data-testid="text-checkout-total">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={orderMutation.isPending}
              data-testid="button-place-order"
            >
              {orderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
