const SERVER_API_BASE_URL = (() => {
  const base = process.env.BACKEND_API_URL_WITH_API ?? process.env.BACKEND_API_URL ?? "http://localhost:5000";
  return base.endsWith("/api") ? base : `${base}/api`;
})();

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
    if (!response.ok) return [];
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
