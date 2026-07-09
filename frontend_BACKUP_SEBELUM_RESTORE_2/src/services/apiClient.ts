const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const isLocalApi = API_URL.includes("localhost") || API_URL.includes("127.0.0.1");

export function isDummyMode() {
  if (process.env.NEXT_PUBLIC_USE_DUMMY === "true") return true;
  if (!API_URL) return true;
  if (process.env.NODE_ENV === "production" && isLocalApi) return true;
  return false;
}

export async function fetchFromApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return response.json() as Promise<T>;
}
