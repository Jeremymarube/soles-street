import Link from "next/link";

import { formatCurrency } from "@/lib/formatCurrency";

const FALLBACK_IMAGE = "/images/hero-sneakers.jpg";

export default function FeaturedProductCard({ product }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-border bg-card transition hover:-translate-y-1 hover:border-accent/50">
      <Link href={`/shop/${product.id}`} className="relative block aspect-square overflow-hidden bg-muted">
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
            {product.badge}
          </span>
        ) : null}
      </Link>
      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.category} • {product.brand}</p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">{product.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-accent">{formatCurrency(product.price)}</p>
          <Link href={`/shop/${product.id}`} className="text-sm text-muted-foreground transition hover:text-accent">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
