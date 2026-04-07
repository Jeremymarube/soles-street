import { apiFetch } from "@/services/api";

export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category && filters.category !== "All") params.set("category", filters.category);
  if (filters.brand && filters.brand !== "All") params.set("brand", filters.brand);
  if (filters.featured !== undefined) params.set("featured", String(filters.featured));

  return apiFetch(`/products/${params.toString() ? `?${params.toString()}` : ""}`);
};

export const getFeaturedProducts = () => getProducts({ featured: true });
export const getProductById = (id) => apiFetch(`/products/${id}`);

export const saveProduct = async (product) => {
  const exists = await getProductById(product.id).catch(() => null);

  if (exists) {
    return apiFetch(`/products/${product.id}`, {
      method: "PUT",
      body: JSON.stringify(product),
      admin: true,
    });
  }

  return apiFetch("/products/", {
    method: "POST",
    body: JSON.stringify(product),
    admin: true,
  });
};

export const createProduct = (product) =>
  apiFetch("/products/", {
    method: "POST",
    body: JSON.stringify(product),
    admin: true,
  });

export const updateProduct = (id, product) =>
  apiFetch(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
    admin: true,
  });

export const deleteProduct = (id) =>
  apiFetch(`/products/${id}`, {
    method: "DELETE",
    admin: true,
  });
