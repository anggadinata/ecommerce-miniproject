import { useQuery } from "@tanstack/react-query";
import { useParams, Navigate, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, Package, AlertCircle } from "lucide-react";
import { useBackend } from "../hooks/useBackend";

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { isSignedIn, isLoaded } = useUser();
  const backend = useBackend();

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      console.log("Fetching order details for ID:", id);
      try {
        const result = await backend.orders.get({ id: parseInt(id!) });
        console.log("Order details fetched successfully:", result);
        return result;
      } catch (err) {
        console.error("Error fetching order details:", err);
        throw err;
      }
    },
    enabled: isSignedIn && isLoaded && !!id && !isNaN(parseInt(id || "")),
    retry: (failureCount, err) => {
      const error = err as any;
      return failureCount < 2 && !error?.message?.includes('unauthenticated');
    },
    staleTime: 60000,
    gcTime: 300000,
  });

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/orders" replace />;
  }

  if (!id || isNaN(parseInt(id))) {
    return <Navigate to="/orders" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    console.error("Failed to load order:", error);
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Failed to load order</h2>
            <p className="text-muted-foreground mb-6">
              {(error as any)?.message || "Order not found or failed to load."}
            </p>
            <div className="space-x-4">
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link to="/orders">Back to Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Order not found.</p>
        <Button asChild className="mt-4">
          <Link to="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const statusVariant = {
    pending: "secondary" as const,
    processing: "default" as const,
    shipped: "default" as const,
    delivered: "default" as const,
    cancelled: "destructive" as const,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Package className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={statusVariant[order.status]} className="ml-auto">
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{item.productName}</h3>
                    <p className="text-muted-foreground">
                      ${item.productPrice} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(item.productPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>${(item.productPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span>#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={statusVariant[order.status]} className="text-xs">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/orders">Back to Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
