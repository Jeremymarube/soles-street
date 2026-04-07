"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AdminGuard from "@/components/AdminGuard";

export default function LegacyEditProductPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/products");
  }, [router]);

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-10 text-muted-foreground">Redirecting...</div>
    </AdminGuard>
  );
}
