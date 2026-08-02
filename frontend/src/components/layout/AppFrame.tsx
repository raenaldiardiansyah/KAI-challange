"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { DataModeProvider } from "@/features/data-mode/DataModeProvider";
import { DashboardLayout } from "./DashboardLayout";

const AUTH_PATHS = new Set(["/login", "/register"]);

export function isAuthPath(pathname: string) {
  return AUTH_PATHS.has(pathname);
}

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isAuthPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <DataModeProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </DataModeProvider>
    </AuthProvider>
  );
}
