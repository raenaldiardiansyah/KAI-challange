"use client";

import { useContext } from "react";
import { AuthContext } from "@/features/auth/AuthProvider";

export function useCurrentUser() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useCurrentUser harus digunakan di dalam AuthProvider.");
  return context;
}
