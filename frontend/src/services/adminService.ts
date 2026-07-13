import type {
  RamsRuleDto,
  RamsRulesResponse,
  RamsUserAdminDto,
  RamsUserCreateDto,
  RamsUserUpdateDto
} from "@/types/api";
import { authUsersFixture, rulesFixture } from "@/dummy/rams";
import type { DataMode } from "./api/dataMode";
import { loadRams } from "./api/ramsDataSource";
import { mapRamsResult, requestRams } from "./api/ramsApiClient";

export const dummyRules: RamsRuleDto[] = rulesFixture.items;
export const dummyUsers: RamsUserAdminDto[] = authUsersFixture;

export async function getRules(signal?: AbortSignal, mode: DataMode = "live") {
  const result = await loadRams<RamsRulesResponse>(mode, "/rules", rulesFixture, { signal, query: { limit: 500 } });
  return mapRamsResult(result, (response) => response.items);
}

export async function getUsers(signal?: AbortSignal, mode: DataMode = "live") {
  return loadRams<RamsUserAdminDto[]>(mode, "/auth/users", authUsersFixture, { signal });
}

export async function createUser(input: RamsUserCreateDto) {
  return requestRams<RamsUserAdminDto>("/auth/users", { method: "POST", body: input });
}

export async function updateUser(userId: number, input: RamsUserUpdateDto) {
  return requestRams<RamsUserAdminDto>(`/auth/users/${userId}`, { method: "PATCH", body: input });
}

export async function updateUserPassword(userId: number, password: string) {
  return requestRams<{ ok: boolean }>(`/auth/users/${userId}/password`, { method: "PATCH", body: { password } });
}
