import { getDefaultDataMode } from "./api/dataMode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function isDummyMode() {
  return getDefaultDataMode() === "dummy";
}

export async function fetchFromApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return response.json() as Promise<T>;
}
