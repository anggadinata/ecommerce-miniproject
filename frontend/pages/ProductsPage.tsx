import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { ProductFilters } from "../components/ProductFilters";
import { useBackend } from "../hooks/useBackend";
import { useDebounce } from "../hooks/useDebounce";

export function ProductsPage() {
  const backend = useBackend();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, selectedCategory, debouncedMinPrice, debouncedMaxPrice, sortBy, sortOrder]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => backend.products.categories(),
  });

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: [
      "products",
      page,
      selectedCategory,
      debouncedMinPrice,
      debouncedMaxPrice,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      backend.products.list({
        page,
        limit: 12,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        minPrice: debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined,
        maxPrice: debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined,
        sortBy: sortBy as "price" | "name" | "created_at",
        sortOrder: sortOrder as "asc" | "desc",
      }),
  });

  const filteredProducts = useMemo(() => {
    if (!productsData?.data || !debouncedSearchTerm) {
      return productsData?.data || [];
    }

    return productsData.data.filter(product =>
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [productsData?.data, debouncedSearchTerm]);

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSearchTerm("");
    setSortBy("created_at");
    setSortOrder("desc");
  };

  const handleLoadMore = () => {
    if (productsData && page < productsData.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  if (error) {
    console.error("Failed to load products:", error);
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load products. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-64 flex-shrink-0">
          <ProductFilters
            categories={categoriesData?.categories || []}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
            onClearFilters={handleClearFilters}
          />
        </aside>

        <main className="flex-1">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found.</p>
                </div>
              )}

              {productsData && page < productsData.totalPages && (
                <div className="text-center">
                  <Button onClick={handleLoadMore} variant="outline">
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
