import { TrendDown, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

type MetricDeltaProps = {
  value: number;
  delta?: number;
  inverse?: boolean;
  compact?: boolean;
  label?: string;
  unit?: "%" | "alarm";
};

function deriveDelta(value: number) {
  if (value >= 85) return 2.6;
  if (value >= 70) return 1.4;
  if (value >= 55) return -1.2;
  if (value >= 35) return -2.4;
  return -3.8;
}

export function MetricDelta({ value, delta, inverse = false, compact = false, label, unit = "%" }: MetricDeltaProps) {
  const change = delta ?? deriveDelta(value);
  const isUp = change >= 0;
  const isPositive = inverse ? !isUp : isUp;
  const Icon = isUp ? TrendUp : TrendDown;
  const absoluteChange = Math.abs(change);
  const displayChange = unit === "%" ? absoluteChange.toFixed(1) : Math.round(absoluteChange).toString();
  const ariaUnit = unit === "%" ? "persen" : "alarm";

  return (
    <span
      className={cn(
        "metric-delta",
        isUp ? "metric-delta-up" : "metric-delta-down",
        isPositive ? "metric-delta-positive" : "metric-delta-negative",
        compact && "metric-delta-compact"
      )}
      aria-label={`${isUp ? "Naik" : "Turun"} ${displayChange} ${ariaUnit}`}
    >
      <Icon size={14} weight="bold" />
      <strong>{displayChange}{unit === "%" ? "%" : ""}</strong>
      {label ? <span>{label}</span> : null}
    </span>
  );
}
