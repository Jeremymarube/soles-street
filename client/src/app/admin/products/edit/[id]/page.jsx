"use client";

import { use, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import AdminGuard from "@/components/AdminGuard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getProductById, updateProduct } from "@/services/productsService";
import { uploadProductImage } from "@/services/uploadService";

const parseSizes = (sizesText) =>
  sizesText
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean)
    .map((size) => Number(size))
    .filter((size) => Number.isFinite(size));

export default function EditProduct({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      const product = await getProductById(id);
      if (active) {
        setForm({
          ...product,
          featured: Boolean(product.featured),
          sizesText: (product.sizes ?? []).join(", "),
        });
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { imageUrl } = await uploadProductImage(file);
      handleChange("image", imageUrl);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const sizes = parseSizes(form.sizesText);

    if (!sizes.length) {
      toast.error("Enter at least one valid shoe size.");
      return;
    }

    try {
      await updateProduct(id, { ...form, price: Number(form.price), sizes, featured: Boolean(form.featured) });
      toast.success("Product updated");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AdminGuard>
        {!form ? (
          <main className="container mx-auto px-4 py-10 text-muted-foreground">Loading product...</main>
        ) : (
          <main className="container mx-auto px-4 py-10">
            <p className="text-sm uppercase tracking-[0.35em] text-accent">Edit product</p>
            <h1 className="mt-2 font-display text-5xl text-foreground">Update shoe details.</h1>
            <form onSubmit={handleSubmit} className="mt-8 grid gap-4 rounded-[28px] border border-border bg-card p-6 md:grid-cols-2">
              <input value={form.name} onChange={(event) => handleChange("name", event.target.value)} className="h-11 rounded-2xl border border-border bg-background px-4 text-foreground outline-none" required />
              <input value={form.price} onChange={(event) => handleChange("price", event.target.value)} type="number" className="h-11 rounded-2xl border border-border bg-background px-4 text-foreground outline-none" required />
              <div className="space-y-3 md:col-span-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" className="border-border text-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Uploading..." : "Add Image"}
                  </Button>
                  <input value={form.image} onChange={(event) => handleChange("image", event.target.value)} className="h-11 flex-1 rounded-2xl border border-border bg-background px-4 text-foreground outline-none" />
                </div>
                {form.image ? <img src={form.image} alt="Preview" className="h-40 w-40 rounded-2xl object-cover" /> : null}
              </div>
              <input value={form.badge ?? ""} onChange={(event) => handleChange("badge", event.target.value)} className="h-11 rounded-2xl border border-border bg-background px-4 text-foreground outline-none" />
              <select value={form.brand} onChange={(event) => handleChange("brand", event.target.value)} className="h-11 rounded-2xl border border-border bg-background px-4 text-foreground outline-none">
                <option>Nike</option>
                <option>Adidas</option>
                <option>Puma</option>
                <option>New Balance</option>
              </select>
              <select value={form.category} onChange={(event) => handleChange("category", event.target.value)} className="h-11 rounded-2xl border border-border bg-background px-4 text-foreground outline-none">
                <option>Men</option>
                <option>Women</option>
                <option>Kids</option>
                <option>Both</option>
              </select>
              <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground md:col-span-2">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(event) => handleChange("featured", event.target.checked)}
                  className="h-4 w-4"
                />
                Show this product in the Featured section on the homepage
              </label>
              <input value={form.sizesText} onChange={(event) => handleChange("sizesText", event.target.value)} placeholder="Sizes e.g. 38, 39, 40, 41" className="h-11 rounded-2xl border border-border bg-background px-4 text-foreground outline-none md:col-span-2" required />
              <textarea value={form.description} onChange={(event) => handleChange("description", event.target.value)} className="min-h-32 rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none md:col-span-2" required />
              <Button type="submit" className="h-11 bg-accent text-accent-foreground hover:bg-accent/90 md:col-span-2">Save changes</Button>
            </form>
          </main>
        )}
      </AdminGuard>
      <Footer />
    </div>
  );
}