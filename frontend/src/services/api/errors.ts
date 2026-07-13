export type ApiErrorDetail = { field?: string; message: string };

export class RamsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details: ApiErrorDetail[] = []
  ) {
    super(message);
    this.name = "RamsApiError";
  }
}

function normalizeDetail(detail: unknown): ApiErrorDetail[] {
  if (typeof detail === "string") return [{ message: detail }];
  if (!Array.isArray(detail)) return [];

  return detail.map((item) => {
    if (!item || typeof item !== "object") return { message: String(item) };
    const entry = item as { loc?: unknown[]; msg?: unknown; message?: unknown };
    return {
      field: entry.loc?.slice(1).join("."),
      message: String(entry.msg ?? entry.message ?? "Data tidak valid")
    };
  });
}

export async function createApiError(response: Response) {
  const payload = await response.json().catch(() => null) as
    | { detail?: unknown; message?: unknown }
    | null;
  const details = normalizeDetail(payload?.detail);
  const message =
    details.map((item) => item.field ? `${item.field}: ${item.message}` : item.message).join(", ") ||
    (typeof payload?.message === "string" ? payload.message : "Permintaan ke RAMS gagal");
  return new RamsApiError(message, response.status, details);
}
