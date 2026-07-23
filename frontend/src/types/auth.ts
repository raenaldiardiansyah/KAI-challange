export type UserRole = "ADMIN" | "TECHNICIAN" | "VIEWER";

export type AuthUser = {
  id: number;
  username: string;
  email: string | null;
  name: string;
  role: UserRole;
  isActive: boolean;
};

export type RamsUserDto = {
  id: number;
  username: string;
  email?: string | null;
  name: string;
  role: UserRole;
  is_active: boolean;
};

export type RamsLoginResponse = {
  ok: true;
  access_token: string;
  refresh_token?: string | null;
  token_type: "bearer" | string;
  expires_in: number;
  user: RamsUserDto;
};

export type RamsRefreshResponse = {
  ok: true;
  access_token: string;
  refresh_token: string;
  token_type: "bearer" | string;
  expires_in: number;
};

export function mapAuthUser(user: RamsUserDto): AuthUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email ?? null,
    name: user.name,
    role: user.role,
    isActive: user.is_active
  };
}
