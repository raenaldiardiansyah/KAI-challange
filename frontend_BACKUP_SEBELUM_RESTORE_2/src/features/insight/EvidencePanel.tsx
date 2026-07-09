import { Card } from "@/components/ui/Card";
import { MetricDelta } from "@/components/ui/MetricDelta";
import type { Insight } from "@/types/insight";

const evidenceMeta: Record<string, { label: string; unit?: string }> = {
  bp: { label: "Brake Pipe", unit: "bar" },
  bc: { label: "Brake Cylinder", unit: "bar" },
  medianBc: { label: "Median BC", unit: "bar" },
  threshold: { label: "Threshold Deviasi", unit: "bar" },
  difference: { label: "Deviasi Aktual", unit: "bar" },
  voltage: { label: "Tegangan", unit: "V" },
  frequency: { label: "Frekuensi", unit: "Hz" },
  rpm: { label: "RPM" },
  fuelLevel: { label: "Level BBM", unit: "%" },
  missingPackets: { label: "Paket Hilang" },
  doorOpenCount: { label: "Door Open Count" },
  lastValidSignalMinutes: { label: "Sinyal Valid Terakhir", unit: "menit" }
};

export function EvidencePanel({ insight }: { insight: Insight }) {
  return (
    <Card title="Bukti Data (Evidence)" eyebrow="Perbandingan Sensor vs Threshold">
      <div className="sensor-grid">
        {Object.entries(insight.evidence).map(([key, value]) => {
          const isAlert = key === "bc" || key === "difference";
          const meta = evidenceMeta[key] ?? { label: key };
          const numericValue = Number(value);
          const isPercent = meta.unit === "%" && Number.isFinite(numericValue);

          return (
          <div key={key} className={isAlert ? "evidence-cell alert" : "evidence-cell"}>
            <span>{meta.label}</span>
            <strong className={isPercent ? "percent-with-delta" : undefined}>
              <span>{value}{meta.unit ? ` ${meta.unit}` : ""}</span>
              {isPercent ? <MetricDelta value={numericValue} compact /> : null}
            </strong>
          </div>
        );})}
      </div>
    </Card>
  );
}
