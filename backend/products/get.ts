import { api, APIError } from "encore.dev/api";
import { productsDB } from "./db";
import type { Product } from "../shared/types";
import log from "encore.dev/log";

interface GetProductParams {
  id: number;
}

// Get a specific product by ID.
export const get = api<GetProductParams, Product>(
  { expose: true, method: "GET", path: "/products/:id" },
  async (params) => {
    log.info("Getting product", { productId: params.id });
    
    const product = await productsDB.queryRow<Product>`
      SELECT 
        id, name, description, price, category, 
        image_url as "imageUrl", stock, created_at as "createdAt"
      FROM products 
      WHERE id = ${params.id}
    `;

    if (!product) {
      log.error("Product not found", { productId: params.id });
      throw APIError.notFound("product not found");
    }

    log.info("Product found", { 
      productId: product.id, 
      name: product.name, 
      stock: product.stock 
    });
    
    return product;
  }
);
