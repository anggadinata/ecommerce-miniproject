import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Order } from "~backend/shared/types";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const statusVariant = {
    pending: "secondary" as const,
    processing: "default" as const,
    shipped: "default" as const,
    delivered: "default" as const,
    cancelled: "destructive" as const,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
        <Badge variant={statusVariant[order.status]}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items:</span>
            <span>{order.items.length} item(s)</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
          </div>
          
          <div className="pt-3 border-t">
            <Button asChild variant="outline" className="w-full">
              <Link to={`/orders/${order.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
