import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { ordersDB } from "./db";
import type { Order } from "../shared/types";
import log from "encore.dev/log";

interface GetOrderParams {
  id: number;
}

// Get a specific order by ID for the authenticated user.
export const get = api<GetOrderParams, Order>(
  { auth: true, expose: true, method: "GET", path: "/orders/:id" },
  async (params) => {
    log.info("Get order endpoint called", { orderId: params.id });
    
    const auth = getAuthData();
    if (!auth) {
      log.error("No auth data available in get order endpoint");
      throw APIError.unauthenticated("authentication required");
    }

    log.info("Getting order", { userId: auth.userID, orderId: params.id });

    const order = await ordersDB.queryRow<any>`
      SELECT 
        id, user_id as "userId", total_amount as "totalAmount", 
        status, created_at as "createdAt"
      FROM orders 
      WHERE id = ${params.id} AND user_id = ${auth.userID}
    `;

    if (!order) {
      log.error("Order not found", { orderId: params.id, userId: auth.userID });
      throw APIError.notFound("order not found");
    }

    // Get order items
    const items = await ordersDB.queryAll<any>`
      SELECT 
        id, order_id as "orderId", product_id as "productId", 
        product_name as "productName", product_price as "productPrice", quantity
      FROM order_items 
      WHERE order_id = ${params.id}
    `;

    log.info("Order retrieved successfully", { 
      orderId: order.id, 
      userId: order.userId, 
      itemsCount: items.length 
    });

    return {
      ...order,
      items,
    };
  }
);
