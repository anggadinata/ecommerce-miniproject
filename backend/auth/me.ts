import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { User } from "../shared/types";

// Get current user information.
export const me = api<void, User>(
  { auth: true, expose: true, method: "GET", path: "/auth/me" },
  async () => {
    const auth = getAuthData()!;
    return {
      id: auth.userID,
      email: auth.email || "",
      name: auth.userID,
      createdAt: new Date(),
    };
  }
);
