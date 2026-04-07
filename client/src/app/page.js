import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react";

import Footer from "@/components/Footer";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Men", href: "/categories/men" },
  { name: "Women", href: "/categories/women" },
  { name: "Kids", href: "/categories/kids" },
];

function FeaturedProductsFallback() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Featured</p>
          <h2 className="mt-2 font-display text-4xl text-foreground">Top picks right now</h2>
        </div>
      </div>
      <div className="mt-8 rounded-[28px] border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">
        Loading featured shoes...
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <section className="border-b border-border bg-[radial-gradient(circle_at_top,#7f1d1d_0%,#0a0a0a_55%)]">
          <div className="container mx-auto grid gap-10 px-4 py-20 md:grid-cols-[1.2fr_0.8fr] md:py-28">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.45em] text-accent">Fast mobile sneaker store</p>
              <h1 className="mt-4 font-display text-5xl leading-none text-foreground md:text-7xl">Browse kicks. Add to cart. Checkout or order on WhatsApp.</h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                Where style meets the streets. Premium sneakers, trendy kicks, and countrywide delivery every Saturday.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 bg-accent px-6 text-accent-foreground hover:bg-accent/90">
                  <Link href="/shop">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 rounded-[32px] border border-border bg-black/30 p-5 backdrop-blur">
              <div className="rounded-3xl border border-border bg-card p-5">
                <ShoppingBag className="h-6 w-6 text-accent" />
                <h2 className="mt-4 text-xl font-semibold">Add cart + checkout</h2>
                <p className="mt-2 text-sm text-muted-foreground">Customers can build an order first, then pay with M-Pesa or finish on WhatsApp.</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <MessageCircle className="h-6 w-6 text-accent" />
                <h2 className="mt-4 text-xl font-semibold">Instant WhatsApp orders</h2>
                <p className="mt-2 text-sm text-muted-foreground">Every product card includes a pre-filled order message for quick seller contact.</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <ShieldCheck className="h-6 w-6 text-accent" />
                <h2 className="mt-4 text-xl font-semibold">Admin dashboard</h2>
                <p className="mt-2 text-sm text-muted-foreground">Products and uploads are protected behind the admin login so shoppers cannot edit inventory.</p>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<FeaturedProductsFallback />}>
          <FeaturedProductsSection />
        </Suspense>

        <section className="container mx-auto px-4 pb-16">
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.name} href={category.href} className="rounded-[28px] border border-border bg-card p-6 transition hover:border-accent/50 hover:bg-card/80">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Category</p>
                <h3 className="mt-3 text-2xl font-semibold text-foreground">{category.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Shop {category.name.toLowerCase()} sneakers with mobile-friendly browsing.</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
