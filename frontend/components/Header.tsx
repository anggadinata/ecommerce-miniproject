import { Link } from "react-router-dom";
import { ShoppingCart, User, Package } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "../hooks/useCart";

export function Header() {
  const { isSignedIn } = useUser();
  const { totalItems } = useCart();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            E-Shop
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/products" className="hover:text-primary transition-colors">
              Products
            </Link>

            {isSignedIn && (
              <Link to="/orders" className="hover:text-primary transition-colors flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders
              </Link>
            )}

            <Link to="/checkout" className="hover:text-primary transition-colors relative">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart
                {totalItems > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {totalItems}
                  </Badge>
                )}
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
