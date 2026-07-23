import type { UserRole } from "@/types/auth";

export type Permission =
  | "view_dashboard"
  | "maintenance_action"
  | "refresh_analytics"
  | "manage_users"
  | "manage_system";

const rolePermissions: Record<UserRole, Permission[]> = {
  VIEWER: ["view_dashboard"],
  TECHNICIAN: ["view_dashboard", "maintenance_action"],
  ADMIN: ["view_dashboard", "maintenance_action", "refresh_analytics", "manage_users", "manage_system"]
};

export function hasPermission(role: UserRole | null | undefined, permission: Permission) {
  return role ? rolePermissions[role].includes(permission) : false;
}
