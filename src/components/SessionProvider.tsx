"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, SESSION_EXPIRED_EVENT, type SessionUser } from "@/lib/api";

interface SessionCtx {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<SessionCtx>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function SessionProvider({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: "CUSTOMER" | "ADMIN";
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await auth.me();
      setUser(user);
      // One login page for everyone: /login sends each account to its own app.
      if (requireRole && !user) {
        router.replace("/login");
        return;
      }
      // A customer who wandered into the admin console goes back to their own app.
      if (requireRole === "ADMIN" && user && user.role === "CUSTOMER") {
        router.replace("/dashboard");
      }
      // A staff account viewing the customer app: send them to the tool
      // they actually work in instead of a dashboard that will only ever
      // show their own (empty) order history.
      if (requireRole === "CUSTOMER" && user && user.role !== "CUSTOMER") {
        router.replace("/admin");
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [requireRole, router]);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  // Started from a timer callback, not synchronously in the effect body.
  useEffect(() => {
    const t = setTimeout(() => {
      refresh();
    }, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  // Every API call that gets a 401 fires this (see src/lib/api.ts). Without
  // it, a deactivated or demoted account kept browsing on whatever was
  // already rendered — stale nav, stale data — until they manually reloaded.
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  return (
    <Ctx.Provider value={{ user, loading, refresh, logout }}>{children}</Ctx.Provider>
  );
}

export const useSession = () => useContext(Ctx);

/** Format a rupee amount like ₹2,450.00 (Indian grouping). */
export function inr(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
