"use client";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { adminLogin, getAdminSession } from "@/services/adminService";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingExistingSession, setCheckingExistingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const redirectIfAlreadyLoggedIn = async () => {
      try {
        const session = await getAdminSession();
        if (active && session.authenticated) {
          router.replace(searchParams.get("next") || "/admin");
          return;
        }
      } catch {
        // Silent fail
      }

      if (active) {
        setCheckingExistingSession(false);
      }
    };

    redirectIfAlreadyLoggedIn();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  const confirmSession = async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const session = await getAdminSession().catch(() => ({ authenticated: false }));
      if (session.authenticated) return true;
      await wait(150);
    }

    return false;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      await adminLogin({ username, password });

      const hasSession = await confirmSession();
      if (!hasSession) {
        throw new Error("Login succeeded, but the admin session was not saved. Make sure you are using http://localhost:3000 and restart both apps.");
      }

      toast.success("Admin access granted.");
      router.replace(searchParams.get("next") || "/admin");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-md rounded-[28px] border border-border bg-card p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-accent">Admin login</p>
          <h1 className="mt-2 font-display text-4xl text-foreground">Owner sign in</h1>
          <p className="mt-3 text-sm text-muted-foreground">Sign in with the admin username and password to manage products and uploads.</p>

          {checkingExistingSession ? (
            <div className="mt-6 text-sm text-muted-foreground">Checking admin session...</div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Admin username"
                className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-foreground outline-none"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Admin password"
                className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-foreground outline-none"
                required
              />
              <Button type="submit" disabled={isSubmitting} className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isSubmitting ? "Checking..." : "Login"}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}