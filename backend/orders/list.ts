import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { ordersDB } from "./db";
import type { Order, PaginatedResponse } from "../shared/types";
import log from "encore.dev/log";

interface ListOrdersParams {
  page?: Query<number>;
  limit?: Query<number>;
}

// Get orders for the authenticated user.
export const list = api<ListOrdersParams, PaginatedResponse<Order>>(
  { auth: true, expose: true, method: "GET", path: "/orders" },
  async (params) => {
    log.info("List orders endpoint called");
    
    const auth = getAuthData();
    if (!auth) {
      log.error("No auth data available in list orders endpoint");
      throw APIError.unauthenticated("authentication required");
    }

    log.info("Listing orders", { userId: auth.userID });
    
    const page = params.page || 1;
    const limit = Math.min(params.limit || 10, 50);
    const offset = (page - 1) * limit;

    try {
      // Get total count
      const countResult = await ordersDB.queryRow<{ count: number }>`
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE user_id = ${auth.userID}
      `;
      const total = countResult?.count || 0;

      // Get orders
      const orders = await ordersDB.queryAll<any>`
        SELECT 
          id, user_id as "userId", total_amount as "totalAmount", 
          status, created_at as "createdAt"
        FROM orders 
        WHERE user_id = ${auth.userID}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await ordersDB.queryAll<any>`
            SELECT 
              id, order_id as "orderId", product_id as "productId", 
              product_name as "productName", product_price as "productPrice", quantity
            FROM order_items 
            WHERE order_id = ${order.id}
          `;
          return { ...order, items };
        })
      );

      const totalPages = Math.ceil(total / limit);

      log.info("Orders listed successfully", { 
        userId: auth.userID, 
        total, 
        page, 
        ordersCount: ordersWithItems.length 
      });

      return {
        data: ordersWithItems,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      log.error("Failed to list orders", { 
        userId: auth.userID, 
        error: error.message,
        stack: error.stack 
      });
      throw APIError.internal("failed to retrieve orders");
    }
  }
);
