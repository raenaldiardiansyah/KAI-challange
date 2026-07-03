import { trainsetDummy } from "@/dummy/trainsetDummy";
import type { Trainset } from "@/types/trainset";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getTrainsets(): Promise<Trainset[]> {
  if (isDummyMode()) return trainsetDummy;
  return fetchFromApi<Trainset[]>("/trainsets");
}

export async function getTrainset(id: string): Promise<Trainset | undefined> {
  if (isDummyMode()) return trainsetDummy.find((trainset) => trainset.id === id);
  return fetchFromApi<Trainset>(`/trainsets/${id}`);
}
