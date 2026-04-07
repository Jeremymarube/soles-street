"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { getProducts } from "@/services/productsService";

export default function ShopClient({ initialProducts, initialFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    const nextFilters = {
      search: searchParams.get("search") ?? "",
      category: searchParams.get("category") ?? "All",
      brand: searchParams.get("brand") ?? "All",
    };

    setFilters((current) => {
      if (
        current.search === nextFilters.search &&
        current.category === nextFilters.category &&
        current.brand === nextFilters.brand
      ) {
        return current;
      }

      return nextFilters;
    });
  }, [searchParams]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    let active = true;

    const loadProducts = async () => {
      setLoading(true);
      const nextProducts = await getProducts(filters);
      if (active) {
        setProducts(nextProducts);
        setLoading(false);
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);

    const params = new URLSearchParams();
    if (nextFilters.search?.trim()) params.set("search", nextFilters.search.trim());
    if (nextFilters.category && nextFilters.category !== "All") params.set("category", nextFilters.category);
    if (nextFilters.brand && nextFilters.brand !== "All") params.set("brand", nextFilters.brand);

    router.replace(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <SearchBar value={filters.search} onChange={(value) => handleFilterChange("search", value)} />
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
      </aside>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{products.length} shoes found</p>
        </div>
        {loading ? (
          <div className="rounded-[28px] border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">
            Loading products...
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">
            No shoes found yet. Add products from the admin dashboard.
          </div>
        )}
      </section>
    </div>
  );
}
