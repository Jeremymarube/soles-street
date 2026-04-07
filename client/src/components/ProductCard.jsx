import Link from "next/link";
import { MessageCircle } from "lucide-react";

import AddToCartButton from "@/components/AddToCartButton";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { createProductOrderLink } from "@/services/orderService";

const FALLBACK_IMAGE = "/images/hero-sneakers.jpg";

const ProductCard = ({ product }) => {
  return (
    <div className="group overflow-hidden rounded-[28px] border border-border bg-card transition hover:-translate-y-1 hover:border-accent/50">
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
        <div className="grid grid-cols-2 gap-3">
          <AddToCartButton product={product} />
          <Button asChild className="h-11 bg-accent text-accent-foreground hover:bg-accent/90">
            <a href={createProductOrderLink(product)} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Order Now
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
