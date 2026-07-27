import { workOrderDummy } from "@/dummy/workOrderDummy";
import type { SpkRow } from "@/types/workOrder";

/** LOCAL / PROTOTYPE: RAMS does not document a work-order endpoint yet. */
export async function getWorkOrders(): Promise<SpkRow[]> {
  return workOrderDummy;
}
