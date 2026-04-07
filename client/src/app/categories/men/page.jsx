import Footer from "@/components/Footer";
import FeaturedProductCard from "@/components/home/FeaturedProductCard";
import Navbar from "@/components/Navbar";
import { getProductsServer } from "@/services/productsServer";

export default async function MenPage() {
  const products = await getProductsServer({ category: "Men" });
  const bothProducts = await getProductsServer({ category: "Both" });
  const visibleProducts = [...products, ...bothProducts];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <h1 className="font-display text-5xl text-foreground">Men&apos;s sneakers</h1>
        {visibleProducts.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {visibleProducts.map((product) => <FeaturedProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-[28px] border border-dashed border-border bg-card/40 p-10 text-center text-muted-foreground">No men&apos;s or both-category shoes added yet.</div>
        )}
      </main>
      <Footer />
    </div>
  );
}
