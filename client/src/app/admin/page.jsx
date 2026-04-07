"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AdminGuard from "@/components/AdminGuard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getAdminSession } from "@/services/adminService";

const AdminPage = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const session = await getAdminSession();
        if (active && session.authenticated) {
          setUsername(session.username || "");
        }
      } catch {
      }
    };

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AdminGuard>
        <main className="container mx-auto px-4 py-10">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Admin dashboard</p>
          <h1 className="mt-2 font-display text-5xl text-foreground">Manage your sneaker catalog.</h1>
          {username ? <p className="mt-3 text-sm text-muted-foreground">Signed in as {username}</p> : null}
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Link href="/admin/products" className="rounded-[28px] border border-border bg-card p-6 transition hover:border-accent/50">
              <h2 className="text-xl font-semibold text-foreground">Products</h2>
              <p className="mt-2 text-sm text-muted-foreground">View, edit, and remove shoes.</p>
            </Link>
            <Link href="/admin/products/add" className="rounded-[28px] border border-border bg-card p-6 transition hover:border-accent/50">
              <h2 className="text-xl font-semibold text-foreground">Add shoe</h2>
              <p className="mt-2 text-sm text-muted-foreground">Create a new listing with price, image, and category.</p>
            </Link>
            <Link href="/shop" className="rounded-[28px] border border-border bg-card p-6 transition hover:border-accent/50">
              <h2 className="text-xl font-semibold text-foreground">Preview store</h2>
              <p className="mt-2 text-sm text-muted-foreground">See how the storefront looks to customers.</p>
            </Link>
          </div>
        </main>
      </AdminGuard>
      <Footer />
    </div>
  );
};

export default AdminPage;
