import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "../hooks/useCart";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}
/*
  check props
*/
export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value) || 0;
    onUpdateQuantity(item.productId, quantity);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-16 h-16 object-cover rounded"
          />
          
          <div className="flex-1">
            <h3 className="font-semibold">{item.productName}</h3>
            <p className="text-muted-foreground">${item.productPrice}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-16 text-center"
              min="1"
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-right">
            <p className="font-semibold">
              ${(item.productPrice * item.quantity).toFixed(2)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.productId)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
