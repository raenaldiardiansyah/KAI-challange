import { WorkOrderWorkspace } from "@/features/work-order/WorkOrderWorkspace";
import { getWorkOrders } from "@/services/workOrderService";

export default async function WorkOrderPage() {
  const workOrders = await getWorkOrders();

  return <WorkOrderWorkspace workOrders={workOrders} />;
}
