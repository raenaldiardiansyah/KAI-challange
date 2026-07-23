"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { DataModeProvider } from "@/features/data-mode/DataModeProvider";
import { DashboardLayout } from "./DashboardLayout";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
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
