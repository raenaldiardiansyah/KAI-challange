import { describe, expect, it } from "vitest";
import { hasPermission } from "../permissions";

describe("role permissions", () => {
  it("keeps viewers read-only", () => {
    expect(hasPermission("VIEWER", "view_dashboard")).toBe(true);
    expect(hasPermission("VIEWER", "maintenance_action")).toBe(false);
  });

  it("allows technicians to perform maintenance actions", () => {
    expect(hasPermission("TECHNICIAN", "maintenance_action")).toBe(true);
    expect(hasPermission("TECHNICIAN", "manage_users")).toBe(false);
  });

  it("allows administrators to manage users and system", () => {
    expect(hasPermission("ADMIN", "manage_users")).toBe(true);
    expect(hasPermission("ADMIN", "manage_system")).toBe(true);
  });
});
