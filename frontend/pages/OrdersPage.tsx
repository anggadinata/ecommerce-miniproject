import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Loader2, User, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { OrderCard } from "../components/OrderCard";
import { useBackend } from "../hooks/useBackend";

export function OrdersPage() {
  const { isSignedIn, isLoaded } = useUser();
  const backend = useBackend();

  const { data: ordersData, isLoading, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      console.log("Fetching orders...");
      try {
        const result = await backend.orders.list();
        console.log("Orders fetched successfully:", result);
        return result;
      } catch (err) {
        console.error("Error fetching orders:", err);
        throw err;
      }
    },
    enabled: isSignedIn && isLoaded,
    retry: (failureCount, error) => {
      console.log("Query retry attempt:", failureCount, "Error:", error);
      // Only retry up to 2 times and not for auth errors
      return failureCount < 2 && !error?.message?.includes('unauthenticated');
    },
    // Improve cache behavior
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Sign in required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your order history.
            </p>
            <Button asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    console.error("Failed to load orders:", error);
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Failed to load orders</h2>
            <p className="text-muted-foreground mb-6">
              {error?.message || "There was an error loading your orders. Please try again."}
            </p>
            <div className="space-x-4">
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ordersData?.data || ordersData.data.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link to="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <Button variant="outline" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ordersData.data.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
