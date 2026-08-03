import type { UserRole } from "@/types/auth";

export type RamsUserAdminDto = {
  id: number;
  username: string;
  email: string | null;
  name: string;
  role: UserRole;
  is_active: boolean;
  account_status: "PENDING" | "APPROVED" | "REJECTED";
};

export type RamsUserCreateDto = Omit<RamsUserAdminDto, "id" | "account_status"> & { password: string };
export type RamsUserUpdateDto = Partial<Pick<RamsUserAdminDto, "email" | "name" | "role" | "is_active">>;
