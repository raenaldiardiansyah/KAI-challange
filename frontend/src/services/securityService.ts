import type { AuditLogDto, AuthSessionDto } from "@/types/api";
import { requestRams } from "./api/ramsApiClient";

export function getAuthSessions(signal?: AbortSignal) {
  return requestRams<AuthSessionDto[]>("/auth/sessions", { signal });
}

export function revokeAuthSession(sessionId: string) {
  return requestRams<{ ok: true }>(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
}

export function getAuditLogs(signal?: AbortSignal) {
  return requestRams<AuditLogDto[]>("/auth/audit-logs", { signal });
}
