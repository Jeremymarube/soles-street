"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/formatCurrency";
import { apiFetch } from "@/services/api";
import { initiateMpesaPayment } from "@/services/mpesaService";
import { createCartOrderLink, createOrder } from "@/services/orderService";

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState(null);

  const paymentMethod = "M-Pesa / WhatsApp";
  const orderPayload = { cart, customerName, phone, paymentMethod };
  const whatsappLink = createCartOrderLink(orderPayload);

  useEffect(() => {
    let active = true;

    const loadMpesaStatus = async () => {
      try {
        const status = await apiFetch("/mpesa/status");
        if (active) setMpesaStatus(status);
      } catch {
        if (active) setMpesaStatus(null);
      }
    };

    loadMpesaStatus();

    return () => {
      active = false;
    };
  }, []);

  const handleMpesaPayment = async () => {
    try {
      setIsPaying(true);
      const order = await createOrder(orderPayload);
      const response = await initiateMpesaPayment({ phone, amount: subtotal, orderId: order.id });
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsPaying(false);
    }
  };

  const handleWhatsAppCheckout = async () => {
    try {
      await createOrder(orderPayload);
      window.open(whatsappLink, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const mpesaWarning = mpesaStatus?.stkEnabled
    ? mpesaStatus.environment === "production"
      ? `Live M-Pesa is enabled. Payments will go to shortcode ${mpesaStatus.shortcode}.`
      : `Sandbox M-Pesa is enabled for shortcode ${mpesaStatus.shortcode}.`
    : "M-Pesa STK push is currently disabled.";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Checkout</p>
          <h1 className="mt-2 font-display text-5xl text-foreground">Finish the order your way.</h1>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Add shoes to your cart before checkout.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[28px] border border-border bg-card p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {/* <label className="space-y-2 text-sm text-muted-foreground">
                  <span>Full name</span>
                  <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-foreground outline-none" placeholder="Jane Doe" />
                </label>
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span>M-Pesa phone number</span>
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-foreground outline-none" placeholder="07XXXXXXXX" />
                </label> */}
              </div>

              <div className="mt-6 rounded-[24px] border border-border bg-background/40 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Order summary</p>
                <div className="mt-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-lg font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>

            <aside className="rounded-[28px] border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Payment options</p>
              <div className="mt-4 rounded-2xl border border-border bg-background/50 p-4 text-sm text-muted-foreground">
                {mpesaWarning}
              </div>
              <div className="mt-5 space-y-3">
                <Button 
  onClick={handleMpesaPayment} 
  disabled={isPaying || !phone}
  className={`h-11 w-full transition-all duration-200
    ${(isPaying || !phone) 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
      : 'bg-accent text-accent-foreground hover:bg-accent/90'
    }`}
>
  {isPaying ? "Processing..." : !phone ? "Mpesa Checkout Coming Soon" : "Pay with M-Pesa"}
</Button>
                <Button 
  onClick={handleWhatsAppCheckout} 
  className="h-11 w-full bg-green-600 text-white hover:bg-green-700"
>
  Order on WhatsApp
</Button>
                <Button onClick={clearCart} variant="ghost" className="h-11 w-full text-muted-foreground hover:text-foreground">
                  Clear cart after order
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
