import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as cartApi from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const EMPTY_CART = { items: [], subtotal: 0, total_items: 0 };

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(EMPTY_CART);
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.fetchCart();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  async function addItem(productId, quantity = 1, size = "Onesize") {
    if (!user) {
      const err = new Error("You need to log in to add items to your cart");
      err.code = "AUTH_REQUIRED";
      throw err;
    }
    const data = await cartApi.addToCart(productId, quantity, size);
    setCart(data);
  }

  async function updateItem(itemId, payload) {
    const data = await cartApi.updateCartItem(itemId, payload);
    setCart(data);
  }

  async function removeItem(itemId) {
    const data = await cartApi.removeCartItem(itemId);
    setCart(data);
  }

  async function clear() {
    const data = await cartApi.clearCart();
    setCart(data);
  }

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, clear, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
