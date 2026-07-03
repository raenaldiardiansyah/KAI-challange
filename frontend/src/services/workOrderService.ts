import { workOrderDummy } from "@/dummy/workOrderDummy";
import type { WorkOrder } from "@/types/workOrder";
import { fetchFromApi, isDummyMode } from "./apiClient";

export async function getWorkOrders(): Promise<WorkOrder[]> {
  if (isDummyMode()) return workOrderDummy;
  return fetchFromApi<WorkOrder[]>("/work-orders");
}
