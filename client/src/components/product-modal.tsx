import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, X } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductModalProps {
  product: Product | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onClose: () => void;
  onBuyNow: () => void;
}

export default function ProductModal({ 
  product, 
  quantity, 
  onQuantityChange, 
  onClose, 
  onBuyNow 
}: ProductModalProps) {
  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (quantity < product.stock) {
      onQuantityChange(quantity + 1);
    }
  };

  const totalPrice = product.priceInINR * quantity;

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto forest-card" data-testid="modal-product">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-serif font-bold" data-testid="text-product-name">
              {product.name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full rounded-xl"
                data-testid="img-product-modal"
              />
            ) : (
              <div className="w-full aspect-square rounded-xl bg-muted flex items-center justify-center text-6xl">
                {product.type === "pet" ? "🐾" : product.type === "food" ? "🥘" : "🎾"}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground" data-testid="text-product-description">
                {product.description}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <Badge variant="secondary" data-testid="badge-product-type">
                    {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                  </Badge>
                </div>
                {product.species && (
                  <div className="flex justify-between">
                    <span>Species:</span>
                    <span data-testid="text-product-species">{product.species}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span data-testid="text-product-stock">
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-accent" data-testid="text-product-price">
                  {formatPrice(product.priceInINR)}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <label className="block text-sm font-medium">Quantity:</label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleQuantityDecrease}
                    disabled={quantity <= 1}
                    data-testid="button-quantity-decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleQuantityIncrease}
                    disabled={quantity >= product.stock}
                    data-testid="button-quantity-increase"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {quantity > 1 && (
                <div className="mb-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-accent" data-testid="text-total-price">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full"
                onClick={onBuyNow}
                disabled={product.stock === 0}
                data-testid="button-buy-now"
              >
                {product.stock === 0 ? "Out of Stock" : "Buy Now"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
