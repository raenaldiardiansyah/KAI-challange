import type { WorkOrder } from "@/types/workOrder";

export const workOrderDummy: WorkOrder[] = [
  {
    id: "WO-001",
    trainsetId: "TS-001",
    carNumber: 5,
    title: "Inspect brake cylinder and local valve",
    status: "Draft",
    priority: "High",
    assignee: "Depo Jakarta"
  }
];
