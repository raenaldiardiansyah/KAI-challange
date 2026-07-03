import type { Severity } from "@/types/common";
import { severityClass } from "@/constants/severity";
import { cn } from "@/lib/utils";

type BadgeProps = {
  label: string;
  severity?: Severity;
};

export function Badge({ label, severity }: BadgeProps) {
  return <span className={cn("badge", severity ? severityClass[severity] : "")}>{label}</span>;
}
