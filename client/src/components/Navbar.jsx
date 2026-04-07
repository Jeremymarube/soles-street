"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, Shield, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories/men", label: "Men" },
  { href: "/categories/women", label: "Women" },
  { href: "/categories/kids", label: "Kids" },
  { href: "/contact", label: "Contact" },
];

const BrandMark = () => (
  <>
    <span className="text-foreground">SOLE</span>
    <span className="text-accent">STREET</span>
  </>
);

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { itemCount } = useCart();

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchText.trim()) params.set("search", searchText.trim());
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
    setShowSearch(false);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-18 items-center justify-between gap-4 px-4">
        <Link href="/" className="font-display text-2xl font-bold tracking-[0.25em]">
          <BrandMark />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition hover:text-accent">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowSearch((value) => !value)} className="hidden text-muted-foreground transition hover:text-accent md:inline-flex" aria-label="Search products">
            {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
          <Link href="/admin" aria-label="Open admin dashboard" className="hidden text-muted-foreground transition hover:text-accent md:inline-flex">
            <Shield className="h-5 w-5" />
          </Link>
          <Link href="/cart" aria-label="Open cart" className="relative text-foreground">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <button className="md:hidden" onClick={() => setIsOpen((open) => !open)} aria-label="Toggle menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showSearch ? (
        <div className="hidden border-t border-border bg-card px-4 py-3 md:block">
          <div className="container mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex gap-3">
              <label htmlFor="nav-search" className="sr-only">Search shoes, brands, categories</label>
              <input
                id="nav-search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search shoes, brands, categories..."
                className="h-11 flex-1 rounded-2xl border border-border bg-background px-4 text-foreground outline-none"
              />
              <button type="submit" className="rounded-2xl bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90">
                Search
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {isOpen ? (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 pb-2">
              <label htmlFor="mobile-nav-search" className="sr-only">Search products</label>
              <input
                id="mobile-nav-search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search products"
                className="h-11 flex-1 rounded-2xl border border-border bg-background px-4 text-foreground outline-none"
              />
              <button type="submit" className="rounded-2xl bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent/90">
                Go
              </button>
            </form>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="text-sm text-muted-foreground transition hover:text-accent">
                {link.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setIsOpen(false)} className="text-sm text-muted-foreground transition hover:text-accent">
              Admin
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
