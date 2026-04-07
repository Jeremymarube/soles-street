"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import AdminGuard from "@/components/AdminGuard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { adminLogout } from "@/services/adminService";
import { deleteProduct, getProducts } from "@/services/productsService";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      const result = await getProducts();
      if (active) setProducts(result);
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((current) => current.filter((product) => product.id !== id));
      toast.success("Product removed from catalog");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      toast.success("Admin logged out.");
      window.location.href = "/admin/login";
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AdminGuard>
        <main className="container mx-auto px-4 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-accent">Admin products</p>
              <h1 className="mt-2 font-display text-5xl text-foreground">Manage shoes</h1>
            </div>
            <div className="flex gap-3">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/admin/products/add">Add product</Link>
              </Button>
              <Button onClick={handleLogout} variant="outline" className="border-border text-foreground">
                Logout
              </Button>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col gap-4 rounded-[28px] border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.category} • {product.brand}</p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">{product.name}</h2>
                  <p className="mt-1 text-sm text-accent">{formatCurrency(product.price)}</p>
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="outline" className="border-border text-foreground">
                    <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                  </Button>
                  <Button onClick={() => handleDelete(product.id)} variant="ghost" className="text-muted-foreground hover:text-accent">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </AdminGuard>
      <Footer />
    </div>
  );
}
