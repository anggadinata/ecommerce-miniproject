import { api } from "encore.dev/api";
import { productsDB } from "./db";

interface CategoriesResponse {
  categories: string[];
}

// Get all available product categories.
export const categories = api<void, CategoriesResponse>(
  { expose: true, method: "GET", path: "/products/categories" },
  async () => {
    const result = await productsDB.queryAll<{ category: string }>`
      SELECT DISTINCT category 
      FROM products 
      ORDER BY category
    `;

    return {
      categories: result.map(row => row.category),
    };
  }
);
