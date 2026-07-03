import { carDetailDummy } from "@/dummy/carDetailDummy";
import type { CarDetail } from "@/types/car";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getCarDetails(): Promise<CarDetail[]> {
  if (isDummyMode()) return carDetailDummy;
  return fetchFromApi<CarDetail[]>("/cars");
}

export async function getCarDetail(id: string): Promise<CarDetail | undefined> {
  if (isDummyMode()) return carDetailDummy.find((car) => car.id === id);
  return fetchFromApi<CarDetail>(`/cars/${id}`);
}
