"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

import AddToCartButton from "@/components/AddToCartButton";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { createProductOrderLink } from "@/services/orderService";
import { getProductById } from "@/services/productsService";

const FALLBACK_IMAGE = "/images/hero-sneakers.jpg";

export default function ProductDetails({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [imageSrc, setImageSrc] = useState(FALLBACK_IMAGE);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    let active = true;
    const loadProduct = async () => {
      try {
        const result = await getProductById(id);
        if (active) {
          setProduct(result);
          setImageSrc(result?.image || FALLBACK_IMAGE);
          setSelectedSize(result?.sizes?.[0] ?? null);
        }
      } catch {
        if (active) {
          setProduct(null);
          setImageSrc(FALLBACK_IMAGE);
          setSelectedSize(null);
        }
      }
    };
    loadProduct();
    return () => { active = false; };
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-10 text-muted-foreground">Loading product...</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[32px] border border-border bg-card">
          <img src={imageSrc} alt={product.name} className="h-full w-full object-cover" onError={() => setImageSrc(FALLBACK_IMAGE)} />
        </div>
        <div className="rounded-[32px] border border-border bg-card p-6 lg:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">{product.category} &middot; {product.brand}</p>
          <h1 className="mt-3 font-display text-5xl text-foreground">{product.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
          <p className="mt-6 text-3xl font-semibold text-accent">{formatCurrency(product.price)}</p>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Available sizes</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(product.sizes ?? []).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    selectedSize === size
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-foreground hover:border-accent hover:text-accent"
                  }`}
                >
                  EU {size}
                </button>
              ))}
            </div>
            {selectedSize ? (
              <p className="mt-3 text-sm text-muted-foreground">Selected size: EU {selectedSize}</p>
            ) : null}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <AddToCartButton product={product} selectedSize={selectedSize} requireSize={Boolean(product.sizes?.length)} />
            <Button asChild className="h-11 bg-accent text-accent-foreground hover:bg-accent/90">
              <a href={createProductOrderLink({ ...product, selectedSize })} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Order Now
              </a>
            </Button>
          </div>
          <Link href="/shop" className="mt-6 inline-block text-sm text-muted-foreground transition hover:text-accent">Back to shop</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
