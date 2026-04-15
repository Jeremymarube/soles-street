"use client";

import { Suspense } from "react";
import AdminLoginContent from "./AdminLoginContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}