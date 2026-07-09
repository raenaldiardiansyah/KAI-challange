import { trainsetDummy } from "@/dummy/trainsetDummy";
import type { Trainset } from "@/types/trainset";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getTrainsets(): Promise<Trainset[]> {
  if (isDummyMode()) return trainsetDummy;
  try {
    return await fetchFromApi<Trainset[]>("/trainsets");
  } catch {
    return trainsetDummy;
  }
}

export async function getTrainset(id: string): Promise<Trainset | undefined> {
  if (isDummyMode()) return trainsetDummy.find((trainset) => trainset.id === id);
  try {
    return await fetchFromApi<Trainset>(`/trainsets/${id}`);
  } catch {
    return trainsetDummy.find((t) => t.id === id);
  }
}
