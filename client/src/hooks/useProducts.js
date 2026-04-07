"use client";

import { useEffect, useState } from "react";

import { getProducts } from "@/services/productsService";

export const useProducts = (initialFilters = {}) => {
  const [filters, setFilters] = useState({ search: "", category: "All", brand: "All", ...initialFilters });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return { products, filters, setFilters, loading };
};
