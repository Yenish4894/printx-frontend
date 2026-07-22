"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, type SessionUser } from "@/lib/api";

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
      if (requireRole && !user) {
        router.replace(requireRole === "ADMIN" ? "/admin-login" : "/login");
        return;
      }
      if (requireRole === "ADMIN" && user && user.role === "CUSTOMER") {
        router.replace("/admin-login");
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
      router.replace(requireRole === "ADMIN" ? "/admin-login" : "/login");
    }
  }, [requireRole, router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
