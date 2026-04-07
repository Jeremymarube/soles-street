const CART_KEY = "solestreet-cart";

const readCart = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getCartItems = () => readCart();

export const persistCartItems = (cart) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const clearStoredCart = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CART_KEY);
};

