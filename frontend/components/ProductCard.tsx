import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type { Product } from "~backend/shared/types";
import { useCart } from "../hooks/useCart";
import { useToast } from "@/components/ui/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      imageUrl: product.imageUrl,
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="aspect-square overflow-hidden rounded-t-lg">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
      </div>
      
      <CardContent className="flex-1 p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
          <Badge variant="secondary" className="ml-2">
            {product.category}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${product.price}</span>
          <span className="text-sm text-muted-foreground">
            {product.stock} in stock
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
