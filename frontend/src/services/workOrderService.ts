import { workOrderDummy } from "@/dummy/workOrderDummy";
import type { WorkOrder } from "@/types/workOrder";

/** LOCAL / PROTOTYPE: RAMS does not document a work-order endpoint yet. */
export async function getWorkOrders(): Promise<WorkOrder[]> {
  return workOrderDummy;
}
