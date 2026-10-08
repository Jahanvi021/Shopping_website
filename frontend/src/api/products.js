import client from "./client";

export async function fetchProducts(params = {}) {
  const { data } = await client.get("/products", { params });
  return data;
}

export async function fetchProduct(id) {
  const { data } = await client.get(`/products/${id}`);
  return data;
}

export async function fetchSimilarProducts(id, limit = 8) {
  const { data } = await client.get(`/products/${id}/similar`, { params: { limit } });
  return data;
}

export async function fetchFeaturedProducts(limit = 12) {
  const { data } = await client.get("/products/featured", { params: { limit } });
  return data;
}

export async function fetchCategories() {
  const { data } = await client.get("/categories");
  return data;
}
