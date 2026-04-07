"use client";

import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }) {
  return (
    <CartProvider>
      {children}
      <Toaster richColors position="top-right" />
    </CartProvider>
  );
}
