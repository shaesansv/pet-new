import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card 
      className="forest-card cursor-pointer transform hover:scale-105 transition-all duration-200 overflow-hidden"
      onClick={onClick}
      data-testid={`card-product-${product.id}`}
    >
      {product.images.length > 0 ? (
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-48 object-cover"
          data-testid={`img-product-${product.id}`}
        />
      ) : (
        <div className="w-full h-48 bg-muted flex items-center justify-center text-4xl">
          {product.type === "pet" ? "🐾" : product.type === "food" ? "🥘" : "🎾"}
        </div>
      )}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2" data-testid={`text-name-${product.id}`}>
          {product.name}
        </h3>
        {product.species && (
          <p className="text-sm text-muted-foreground mb-2" data-testid={`text-species-${product.id}`}>
            {product.type.charAt(0).toUpperCase() + product.type.slice(1)} • {product.species}
          </p>
        )}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`text-description-${product.id}`}>
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-accent" data-testid={`text-price-${product.id}`}>
            {formatPrice(product.priceInINR)}
          </span>
          <span className="text-sm text-muted-foreground" data-testid={`text-stock-${product.id}`}>
            {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
