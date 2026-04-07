import Link from "next/link";
import { Camera, Music2 } from "lucide-react";

import { INSTAGRAM_URL, TIKTOK_URL, WHATSAPP_DISPLAY_NUMBER } from "@/data/products";

const SocialLink = ({ href, icon: Icon, label }) => {
  if (!href) {
    return <span className="inline-flex items-center gap-2 text-muted-foreground/60"><Icon className="h-4 w-4" /> {label}</span>;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-accent">
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );
};

const BrandMark = () => (
  <>
    <span className="text-foreground">SOLE</span>
    <span className="text-accent">STREET</span>
  </>
);

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/60 py-10">
      <div className="container mx-auto grid gap-8 px-4 md:grid-cols-4">
        <div>
          <h3 className="font-display text-xl tracking-[0.2em]"><BrandMark /></h3>
          <p className="mt-3 text-sm text-muted-foreground">Fresh sneaker drops, quick WhatsApp orders, and clean mobile shopping from Nairobi.</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Shop</p>
          <div className="mt-3 space-y-2 text-sm">
            <Link href="/shop" className="block text-muted-foreground hover:text-accent">All shoes</Link>
            <Link href="/categories/men" className="block text-muted-foreground hover:text-accent">Men</Link>
            <Link href="/categories/women" className="block text-muted-foreground hover:text-accent">Women</Link>
            <Link href="/categories/kids" className="block text-muted-foreground hover:text-accent">Kids</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Support</p>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>WhatsApp: {WHATSAPP_DISPLAY_NUMBER || "Set NEXT_PUBLIC_WHATSAPP_NUMBER"}</p>
            <p>M-Pesa checkout Coming Soon</p>
            <p>Nairobi, Kenya</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Follow Us</p>
          <div className="mt-3 space-y-3 text-sm">
            <SocialLink href={INSTAGRAM_URL} icon={Camera} label="Instagram" />
            <SocialLink href={TIKTOK_URL} icon={Music2} label="TikTok" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
