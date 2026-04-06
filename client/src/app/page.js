"use client";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
       
         <Image
    src="/images/hero-sneakers.jpg"
    alt="SoleStreet hero sneakers"
    fill
    priority
    className="object-cover opacity-40"
  />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative z-10 text-center px-4 animate-fade-up">
          <h1 className="font-display text-6xl md:text-8xl font-bold tracking-wider text-foreground mb-4">
            SOLE<span className="text-accent text-glow">STREET</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8 tracking-wide">
            Step Into Style
          </p>
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-display tracking-widest text-lg px-8"
          >
            <Link href="/shop">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured */}
      <section className="container py-20">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          Featured Kicks
        </h2>
        <p className="text-muted-foreground mb-10">Our top picks for you</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="font-display tracking-wider border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <Link href="/shop">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* About snippet */}
      <section className="container py-16 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            About SoleStreet
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Founded by <span className="text-foreground font-semibold">Steve Aboko</span>,
            SoleStreet brings you the freshest sneakers from top brands at unbeatable prices.
            Based in Nairobi, we deliver quality kicks right to your doorstep.
            Browse, choose, and order via WhatsApp — it's that simple.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}