const SERVER_API_BASE_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000/api";

const buildProductsUrl = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category && filters.category !== "All") params.set("category", filters.category);
  if (filters.brand && filters.brand !== "All") params.set("brand", filters.brand);
  if (filters.featured !== undefined) params.set("featured", String(filters.featured));

  return `${SERVER_API_BASE_URL}/products${params.toString() ? `?${params.toString()}` : ""}`;
};

export const getProductsServer = async (filters = {}) => {
  try {
    const response = await fetch(buildProductsUrl(filters), {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const products = await response.json();
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
};

export const getFeaturedProductsServer = async () => {
  const products = await getProductsServer({ featured: true });
  return products.slice(0, 4);
};
