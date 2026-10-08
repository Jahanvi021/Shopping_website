import client from "./client";

export async function placeOrder(shippingInfo) {
  const { data } = await client.post("/orders", shippingInfo);
  return data;
}

export async function fetchOrders() {
  const { data } = await client.get("/orders");
  return data;
}

export async function fetchOrder(id) {
  const { data } = await client.get(`/orders/${id}`);
  return data;
}
