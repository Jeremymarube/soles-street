import Link from "next/link";

import FeaturedProductCard from "@/components/home/FeaturedProductCard";
import { getFeaturedProductsServer } from "@/services/productsServer";

export default async function FeaturedProductsSection() {
  const featuredProducts = await getFeaturedProductsServer();

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Featured</p>
          <h2 className="mt-2 font-display text-4xl text-foreground">Top picks right now</h2>
        </div>
        <Link href="/shop" className="text-sm text-muted-foreground transition hover:text-accent">See full shop</Link>
      </div>
      {featuredProducts.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[28px] border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">
          No featured shoes yet. Add your products from the admin dashboard.
        </div>
      )}
    </section>
  );
}
