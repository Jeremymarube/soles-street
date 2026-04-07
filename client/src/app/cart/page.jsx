"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/formatCurrency";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Your cart</p>
          <h1 className="mt-2 font-display text-5xl text-foreground">Review your order.</h1>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-card p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-lg text-foreground">Your cart is empty.</p>
            <p className="mt-2 text-sm text-muted-foreground">Add a few pairs from the shop, then come back to checkout.</p>
            <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/shop">Browse shoes</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.cartKey || item.id} className="rounded-[28px] border border-border bg-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.category} &middot; {item.brand}</p>
                      <h2 className="mt-2 text-xl font-semibold text-foreground">{item.name}</h2>
                      {item.selectedSize ? (
                        <p className="mt-2 text-sm text-muted-foreground">Size: EU {item.selectedSize}</p>
                      ) : null}
                      <p className="mt-2 text-sm text-accent">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                        <button onClick={() => updateQuantity(item.cartKey || item.id, item.quantity - 1)} className="text-muted-foreground hover:text-foreground">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartKey || item.id, item.quantity + 1)} className="text-muted-foreground hover:text-foreground">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.cartKey || item.id)} className="text-sm text-muted-foreground hover:text-accent">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-[28px] border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Summary</p>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-lg font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-6 space-y-3">
                <Button asChild className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/checkout">Proceed to checkout</Link>
                </Button>
                <Button onClick={clearCart} variant="outline" className="h-11 w-full border-border text-foreground">
                  Clear cart
                </Button>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}