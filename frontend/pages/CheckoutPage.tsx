import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, User, Loader2 } from "lucide-react";
import { CartItem } from "../components/CartItem";
import { useCart } from "../hooks/useCart";
import { useBackend } from "../hooks/useBackend";
import { useToast } from "@/components/ui/use-toast";

export function CheckoutPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const backend = useBackend();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrderMutation = useMutation({
    mutationFn: async (orderItems: { productId: number; quantity: number }[]) => {
      console.log("Creating order with items:", orderItems);
      try {
        const result = await backend.orders.create({ items: orderItems });
        console.log("Order creation response:", result);
        return result;
      } catch (error) {
        console.error("Order creation error:", error);
        throw error;
      }
    },
    onSuccess: async (order) => {
      console.log("Order created successfully:", order);
      clearCart();
      
      // Invalidate and refetch orders-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["order"] }),
      ]);
      
      // Optionally pre-populate the cache with the new order
      queryClient.setQueryData(["order", order.id.toString()], order);
      
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id} has been created.`,
      });
      
      // Add a small delay to ensure cache invalidation completes
      setTimeout(() => {
        navigate(`/orders/${order.id}`);
      }, 100);
    },
    onError: (error: any) => {
      console.error("Failed to create order:", error);
      
      let errorMessage = "There was an error processing your order. Please try again.";
      
      // Try to extract more specific error message
      if (error?.message) {
        if (error.message.includes('unauthenticated') || error.message.includes('authentication')) {
          errorMessage = "Please sign in again to place your order.";
        } else {
          errorMessage = error.message;
        }
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Order failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const handleCheckout = async () => {
    if (!isLoaded) {
      toast({
        title: "Please wait",
        description: "Loading authentication status...",
      });
      return;
    }

    if (!isSignedIn) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    console.log("Starting checkout process with items:", items);
    setIsProcessing(true);
    
    const orderItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    console.log("Mapped order items:", orderItems);
    createOrderMutation.mutate(orderItems);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart to get started.
            </p>
            <Button onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map(item => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
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
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>${(item.productPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>

              {!isLoaded ? (
                <Button className="w-full" size="lg" disabled>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </Button>
              ) : !isSignedIn ? (
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    <User className="w-8 h-8 mx-auto mb-2" />
                    <p>Please sign in to place your order</p>
                  </div>
                  <SignInButton mode="modal">
                    <Button className="w-full" size="lg">
                      Sign In to Checkout
                    </Button>
                  </SignInButton>
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - $${totalAmount.toFixed(2)}`
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
