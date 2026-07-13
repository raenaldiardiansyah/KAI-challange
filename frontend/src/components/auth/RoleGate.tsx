"use client";

import type { ReactNode } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasPermission, type Permission } from "@/lib/auth/permissions";

export function RoleGate({
  permission,
  children,
  fallback = null,
  allowInDummyMode = true
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
  allowInDummyMode?: boolean;
}) {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) return null;
  if (!user && allowInDummyMode && process.env.NEXT_PUBLIC_USE_DUMMY === "true") return <>{children}</>;
  return hasPermission(user?.role, permission) ? <>{children}</> : <>{fallback}</>;
}
