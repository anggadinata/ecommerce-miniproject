import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { productsDB } from "./db";
import type { Product, PaginatedResponse } from "../shared/types";

interface ListProductsParams {
  page?: Query<number>;
  limit?: Query<number>;
  category?: Query<string>;
  minPrice?: Query<number>;
  maxPrice?: Query<number>;
  sortBy?: Query<"price" | "name" | "created_at">;
  sortOrder?: Query<"asc" | "desc">;
}

// List products with filtering and pagination.
export const list = api<ListProductsParams, PaginatedResponse<Product>>(
  { expose: true, method: "GET", path: "/products" },
  async (params) => {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 12, 50); // Max 50 items per page
    const offset = (page - 1) * limit;
    const sortBy = params.sortBy || "created_at";
    const sortOrder = params.sortOrder || "desc";

    // Build WHERE clause
    const conditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.category) {
      conditions.push(`category = $${paramIndex}`);
      queryParams.push(params.category);
      paramIndex++;
    }

    if (params.minPrice !== undefined) {
      conditions.push(`price >= $${paramIndex}`);
      queryParams.push(params.minPrice);
      paramIndex++;
    }

    if (params.maxPrice !== undefined) {
      conditions.push(`price <= $${paramIndex}`);
      queryParams.push(params.maxPrice);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM products 
      ${whereClause}
    `;
    const countResult = await productsDB.rawQueryRow<{ count: number }>(countQuery, ...queryParams);
    const total = countResult?.count || 0;

    // Get products
    const productsQuery = `
      SELECT 
        id, name, description, price, category, 
        image_url as "imageUrl", stock, created_at as "createdAt"
      FROM products 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const products = await productsDB.rawQueryAll<Product>(
      productsQuery, 
      ...queryParams, 
      limit, 
      offset
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages,
    };
  }
);
