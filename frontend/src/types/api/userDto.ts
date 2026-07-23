import type { UserRole } from "@/types/auth";

export type RamsUserAdminDto = {
  id: number;
  username: string;
  email: string | null;
  name: string;
  role: UserRole;
  is_active: boolean;
};

export type RamsUserCreateDto = Omit<RamsUserAdminDto, "id"> & { password: string };
export type RamsUserUpdateDto = Partial<Pick<RamsUserAdminDto, "email" | "name" | "role" | "is_active">>;
