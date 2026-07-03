const USE_DUMMY = process.env.NEXT_PUBLIC_USE_DUMMY === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export function isDummyMode() {
  return USE_DUMMY;
}

export async function fetchFromApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return response.json() as Promise<T>;
}
