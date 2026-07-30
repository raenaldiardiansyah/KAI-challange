"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types/auth";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"] as const;

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const payload = await response.json() as { user: AuthUser };
      setUser(payload.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshUser(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshUser]);

  const endSession = useCallback(async (destination: string) => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.replace(destination);
    }
  }, [router]);

  const logout = useCallback(
    async () => endSession("/login"),
    [endSession]
  );

  useEffect(() => {
    if (!user) return;

    let inactivityTimer = 0;
    let lastResetAt = 0;

    const expireSession = () => {
      void endSession("/login?reason=inactive");
    };

    const resetTimer = () => {
      const now = Date.now();
      if (now - lastResetAt < 1000) return;
      lastResetAt = now;
      window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(expireSession, INACTIVITY_TIMEOUT_MS);
    };

    resetTimer();
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, resetTimer, { passive: true });
    }

    return () => {
      window.clearTimeout(inactivityTimer);
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, resetTimer);
      }
    };
  }, [endSession, user]);

  const value = useMemo(() => ({ user, isLoading, refreshUser, logout }), [user, isLoading, refreshUser, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
