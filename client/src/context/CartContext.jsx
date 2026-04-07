"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { clearStoredCart, getCartItems, persistCartItems } from "@/services/cartService";

const CartContext = createContext(null);

const normalizeCartItem = (product) => ({
  ...product,
  id: String(product.id),
  cartKey: product.selectedSize ? `${String(product.id)}::${String(product.selectedSize)}` : String(product.id),
  name: product.name,
  price: Number(product.price) || 0,
  image: product.image || "",
  brand: product.brand || "",
  category: product.category || "",
  description: product.description || "",
  sizes: Array.isArray(product.sizes) ? product.sizes : [],
  selectedSize: product.selectedSize ?? null,
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => getCartItems());

  useEffect(() => {
    persistCartItems(cart);
  }, [cart]);

  const addToCart = (product) => {
    const nextItem = normalizeCartItem(product);

    setCart((current) => {
      const existing = current.find((item) => item.cartKey === nextItem.cartKey);
      if (existing) {
        return current.map((item) =>
          item.cartKey === nextItem.cartKey ? { ...item, quantity: (item.quantity || 0) + 1 } : item
        );
      }

      return [...current, { ...nextItem, quantity: 1 }];
    });
  };

  const removeFromCart = (cartKey) =>
    setCart((current) => current.filter((item) => item.cartKey !== cartKey));

  const updateQuantity = (cartKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    clearStoredCart();
    setCart([]);
  };

  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.quantity || 0) * (Number(item.price) || 0), 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
