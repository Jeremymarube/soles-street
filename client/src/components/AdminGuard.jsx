"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getAdminSession } from "@/services/adminService";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const session = await getAdminSession();
        if (!active) return;

        if (session.authenticated) {
          setStatus("authorized");
          return;
        }
      } catch {
      }

      if (active) {
        setStatus("unauthorized");
        const next = encodeURIComponent(pathname || "/admin");
        router.replace(`/admin/login?next=${next}`);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (status !== "authorized") {
    return (
      <div className="container mx-auto px-4 py-10 text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  return children;
}
