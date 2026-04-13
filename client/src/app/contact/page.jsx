import { Camera, MessageCircle, Music2 } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { INSTAGRAM_URL, TIKTOK_URL, WHATSAPP_DISPLAY_NUMBER, WHATSAPP_NUMBER } from "@/data/products";
import { buildWhatsAppLink } from "@/lib/whatsappLink";

export default function ContactPage() {
  const hasWhatsApp = Boolean(WHATSAPP_NUMBER);
  const contactLink = hasWhatsApp
    ? buildWhatsAppLink("Hi, I want to shop on SoleStreet.", WHATSAPP_NUMBER)
    : "#";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <p className="text-sm uppercase tracking-[0.35em] text-accent">Contact</p>
        <h1 className="mt-2 font-display text-5xl text-foreground">Talk to the seller instantly.</h1>
        <div className="mt-8 max-w-3xl rounded-[28px] border border-border bg-card p-6">
          <p className="text-muted-foreground">Use WhatsApp for quick stock checks, order updates, and delivery questions.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {hasWhatsApp ? (
              <Button asChild className="h-11 bg-accent text-accent-foreground hover:bg-accent/90">
                <a href={contactLink} target="_blank" rel="noreferrer">Open WhatsApp</a>
              </Button>
            ) : (
              <Button type="button" disabled className="h-11 bg-muted text-muted-foreground">
                Set WhatsApp Number
              </Button>
            )}
            <div className="rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm text-muted-foreground">
              <p>Phone: {WHATSAPP_DISPLAY_NUMBER || "Set NEXT_PUBLIC_WHATSAPP_NUMBER"}</p>
              <p>Nairobi, Kenya</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <a 
  href={hasWhatsApp ? contactLink : "#"} 
  target="_blank" 
  rel="noreferrer" 
  className={`rounded-2xl px-4 py-4 text-sm flex items-center justify-center
    ${hasWhatsApp 
      ? "bg-green-600 text-white hover:bg-green-700" 
      : "pointer-events-none bg-gray-300 text-gray-500"
    }`}
>
  <span className="inline-flex items-center gap-2">
    <MessageCircle className="h-4 w-4" /> 
    WhatsApp
  </span>
</a>
            <a 
  href={INSTAGRAM_URL || "#"} 
  target="_blank" 
  rel="noreferrer" 
  className={`rounded-2xl border border-border px-4 py-4 text-sm ${INSTAGRAM_URL ? "hover:border-accent hover:text-accent" : "pointer-events-none text-muted-foreground/60"}`}
>
  <span className="inline-flex items-center gap-2">
    <FaInstagram className="h-4 w-4" /> 
    Instagram
  </span>
</a>

<a 
  href={TIKTOK_URL || "#"} 
  target="_blank" 
  rel="noreferrer" 
  className={`rounded-2xl border border-border px-4 py-4 text-sm ${TIKTOK_URL ? "hover:border-accent hover:text-accent" : "pointer-events-none text-muted-foreground/60"}`}
>
  <span className="inline-flex items-center gap-2">
    <FaTiktok className="h-4 w-4" /> 
    TikTok
  </span>
</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
