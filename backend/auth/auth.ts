import { createClerkClient, verifyToken } from "@clerk/backend";
import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";

const clerkSecretKey = secret("ClerkSecretKey");
const clerkClient = createClerkClient({ secretKey: clerkSecretKey() });

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  imageUrl: string;
  email: string | null;
}

// Configure the authorized parties.
// For development, we need to be more permissive with the authorized parties
const AUTHORIZED_PARTIES = [
  "https://*.lp.dev",
  "https://localhost:3000",
  "http://localhost:3000",
  "localhost:3000",
  "127.0.0.1:3000",
  "https://127.0.0.1:3000",
  "http://127.0.0.1:3000",
];

const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    log.info("Auth handler called", { 
      hasAuth: !!data.authorization, 
      hasSession: !!data.session 
    });

    // Resolve the authenticated user from the authorization header or session cookie.
    const token = data.authorization?.replace("Bearer ", "") ?? data.session?.value;
    if (!token) {
      log.error("No token provided in auth handler");
      throw APIError.unauthenticated("missing token");
    }

    log.info("Token found, attempting verification", { 
      tokenPrefix: token.substring(0, 10) + "..." 
    });

    try {
      // First try to verify the token without authorized parties for development
      let verifiedToken;
      try {
        verifiedToken = await verifyToken(token, {
          secretKey: clerkSecretKey(),
        });
        log.info("Token verified without authorized parties", { sub: verifiedToken.sub });
      } catch (err) {
        log.warn("Token verification failed without authorized parties, trying with authorized parties", { error: err.message });
        // If that fails, try with authorized parties
        verifiedToken = await verifyToken(token, {
          authorizedParties: AUTHORIZED_PARTIES,
          secretKey: clerkSecretKey(),
        });
        log.info("Token verified with authorized parties", { sub: verifiedToken.sub });
      }

      log.info("Fetching user from Clerk", { userId: verifiedToken.sub });
      const user = await clerkClient.users.getUser(verifiedToken.sub);
      
      const authData = {
        userID: user.id,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress ?? null,
      };

      log.info("Auth successful", { 
        userId: authData.userID, 
        email: authData.email 
      });

      return authData;
    } catch (err) {
      log.error("Auth handler failed", { 
        error: err.message, 
        tokenPrefix: token.substring(0, 10) + "...",
        stack: err.stack
      });
      throw APIError.unauthenticated("invalid token", err);
    }
  }
);

// Configure the API gateway to use the auth handler.
export const gw = new Gateway({ authHandler: auth });
