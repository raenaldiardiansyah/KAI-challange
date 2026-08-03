import type { RamsUserAdminDto } from "@/types/api";

export const authUsersFixture: RamsUserAdminDto[] = [
  { id: 1, username: "admin", email: "admin.depo@kai.id", name: "Administrator", role: "ADMIN", is_active: true, account_status: "APPROVED" },
  { id: 2, username: "teknisi", email: "teknisi@kai.id", name: "Teknisi Depo", role: "TECHNICIAN", is_active: true, account_status: "APPROVED" },
  { id: 3, username: "viewer", email: null, name: "Viewer Operasional", role: "VIEWER", is_active: true, account_status: "APPROVED" }
];
