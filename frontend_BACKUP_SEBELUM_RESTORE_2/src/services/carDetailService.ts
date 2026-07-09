import { carDetailDummy } from "@/dummy/carDetailDummy";
import type { CarDetail } from "@/types/car";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getCarDetails(): Promise<CarDetail[]> {
  if (isDummyMode()) return carDetailDummy;
  try {
    return await fetchFromApi<CarDetail[]>("/cars");
  } catch {
    return carDetailDummy;
  }
}

export async function getCarDetail(id: string): Promise<CarDetail | undefined> {
  if (isDummyMode()) return carDetailDummy.find((car) => car.id === id);
  try {
    return await fetchFromApi<CarDetail>(`/cars/${id}`);
  } catch {
    return carDetailDummy.find((car) => car.id === id);
  }
}
