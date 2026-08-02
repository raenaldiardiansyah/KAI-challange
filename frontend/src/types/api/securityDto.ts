export type AuthSessionDto = {
  id: string;
  device_name: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_used_at: string;
  expires_at: string;
};

export type AuditLogDto = {
  id: number;
  actor_user_id: number | null;
  target_user_id: number | null;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
  created_at: string;
};
