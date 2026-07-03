import { MetricDelta } from "@/components/ui/MetricDelta";

export function GaugeChart({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="gauge" style={{ "--gauge-value": `${clamped * 1.8}deg` } as React.CSSProperties}>
      <div className="gauge-arc" />
      <strong>{clamped}%</strong>
      <MetricDelta value={clamped} compact />
      <span className="gauge-label">{label}</span>
    </div>
  );
}
