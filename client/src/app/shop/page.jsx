import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ShopClient from "@/components/shop/ShopClient";
import { getProductsServer } from "@/services/productsServer";

export default async function Shop({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialFilters = {
    search: resolvedSearchParams?.search ?? "",
    category: resolvedSearchParams?.category ?? "All",
    brand: resolvedSearchParams?.brand ?? "All",
  };
  const initialProducts = await getProductsServer(initialFilters);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Sneaker shop</p>
          <h1 className="font-display text-5xl text-foreground">Browse sneakers by style, brand, and category.</h1>
          <p className="max-w-2xl text-muted-foreground">Fast mobile browsing, visible pricing, and direct WhatsApp ordering from every card.</p>
        </div>

        <ShopClient initialProducts={initialProducts} initialFilters={initialFilters} />
      </main>
      <Footer />
    </div>
  );
}
