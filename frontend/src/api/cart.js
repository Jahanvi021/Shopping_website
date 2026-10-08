import client from "./client";

export async function fetchCart() {
  const { data } = await client.get("/cart");
  return data;
}

export async function addToCart(productId, quantity = 1, size = "Onesize") {
  const { data } = await client.post("/cart", { product_id: productId, quantity, size });
  return data;
}

export async function updateCartItem(itemId, payload) {
  const { data } = await client.put(`/cart/${itemId}`, payload);
  return data;
}

export async function removeCartItem(itemId) {
  const { data } = await client.delete(`/cart/${itemId}`);
  return data;
}

export async function clearCart() {
  const { data } = await client.delete("/cart");
  return data;
}
