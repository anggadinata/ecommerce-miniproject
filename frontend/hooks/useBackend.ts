import { useAuth } from "@clerk/clerk-react";
import backend from "~backend/client";

// Returns the backend client with authentication if user is signed in.
export function useBackend() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded || !isSignedIn) {
    return backend;
  }
  
  return backend.with({
    auth: async () => {
      try {
        const token = await getToken({
          skipCache: true,
        });
        console.log("Got token for backend call:", token ? "✓" : "✗");
        if (token) {
          console.log("Token prefix:", token.substring(0, 20) + "...");
        }
        return token ? { authorization: `Bearer ${token}` } : {};
      } catch (error) {
        console.error("Failed to get token:", error);
        throw new Error("Authentication failed. Please try signing in again.");
      }
    }
  });
}
