import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { ordersDB } from "./db";
import { products } from "~encore/clients";
import type { CartItem, Order } from "../shared/types";
import log from "encore.dev/log";

interface CreateOrderRequest {
  items: CartItem[];
}

// Create a new order from cart items.
export const create = api<CreateOrderRequest, Order>(
  { auth: true, expose: true, method: "POST", path: "/orders" },
  async (req) => {
    log.info("Order creation endpoint called");
    
    const auth = getAuthData();
    if (!auth) {
      log.error("No auth data available in create order endpoint");
      throw APIError.unauthenticated("authentication required");
    }

    log.info("Creating order", { userId: auth.userID, itemsCount: req.items?.length });

    if (!req.items || req.items.length === 0) {
      log.error("Order creation failed: no items provided");
      throw APIError.invalidArgument("order must contain at least one item");
    }

    // Validate quantities
    for (const item of req.items) {
      if (item.quantity <= 0) {
        log.error("Order creation failed: invalid quantity", { productId: item.productId, quantity: item.quantity });
        throw APIError.invalidArgument("quantity must be greater than 0");
      }
    }

    // Start transaction
    await using tx = await ordersDB.begin();

    try {
      // Fetch product details and validate stock
      const orderItems = [];
      let totalAmount = 0;

      for (const item of req.items) {
        try {
          log.info("Fetching product", { productId: item.productId });
          const product = await products.get({ id: item.productId });
          
          if (product.stock < item.quantity) {
            log.error("Insufficient stock", { 
              productId: item.productId, 
              productName: product.name, 
              requestedQuantity: item.quantity, 
              availableStock: product.stock 
            });
            throw APIError.failedPrecondition(`insufficient stock for product ${product.name}`);
          }

          const itemTotal = product.price * item.quantity;
          totalAmount += itemTotal;

          orderItems.push({
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            quantity: item.quantity,
          });

          log.info("Product validated", { 
            productId: product.id, 
            productName: product.name, 
            quantity: item.quantity, 
            itemTotal 
          });
        } catch (error) {
          log.error("Failed to fetch product", { productId: item.productId, error: error.message });
          throw error;
        }
      }

      log.info("Creating order record", { totalAmount, itemsCount: orderItems.length });

      // Create order
      const orderResult = await tx.queryRow<{ id: number }>`
        INSERT INTO orders (user_id, total_amount, status)
        VALUES (${auth.userID}, ${totalAmount}, 'pending')
        RETURNING id
      `;

      if (!orderResult) {
        log.error("Failed to create order record");
        throw APIError.internal("failed to create order");
      }

      const orderId = orderResult.id;
      log.info("Order record created", { orderId });

      // Create order items
      for (const item of orderItems) {
        await tx.exec`
          INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
          VALUES (${orderId}, ${item.productId}, ${item.productName}, ${item.productPrice}, ${item.quantity})
        `;
      }

      log.info("Order items created", { orderId, itemsCount: orderItems.length });

      await tx.commit();
      log.info("Transaction committed", { orderId });

      // Fetch the complete order
      const order = await ordersDB.queryRow<Order>`
        SELECT 
          id, user_id as "userId", total_amount as "totalAmount", 
          status, created_at as "createdAt"
        FROM orders 
        WHERE id = ${orderId}
      `;

      if (!order) {
        log.error("Failed to retrieve created order", { orderId });
        throw APIError.internal("failed to retrieve created order");
      }

      // Fetch order items
      const items = await ordersDB.queryAll<any>`
        SELECT 
          id, order_id as "orderId", product_id as "productId", 
          product_name as "productName", product_price as "productPrice", quantity
        FROM order_items 
        WHERE order_id = ${orderId}
      `;

      log.info("Order created successfully", { 
        orderId: order.id, 
        userId: order.userId, 
        totalAmount: order.totalAmount,
        itemsCount: items.length 
      });

      return {
        ...order,
        items,
      };
    } catch (error) {
      log.error("Order creation failed, rolling back transaction", { 
        userId: auth.userID, 
        error: error.message,
        stack: error.stack 
      });
      await tx.rollback();
      throw error;
    }
  }
);
