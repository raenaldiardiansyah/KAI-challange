import type { HealthStatus } from "@/types/common";
import { healthStatusClass } from "@/constants/status";
import { cn } from "@/lib/utils";

export function StatusIndicator({ status }: { status: HealthStatus }) {
  return (
    <span className={cn("status-indicator", healthStatusClass[status])}>
      <span aria-hidden="true" />
      {status}
    </span>
  );
}
