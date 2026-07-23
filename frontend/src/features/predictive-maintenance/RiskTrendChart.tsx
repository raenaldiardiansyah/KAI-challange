"use client";

import { Info } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { PredictiveRiskView } from "./riskViewModel";

type RiskTrendChartProps = {
  selectedRisk?: PredictiveRiskView;
  onOpenDetail: () => void;
};

export function RiskTrendChart({ selectedRisk, onOpenDetail }: RiskTrendChartProps) {
  const [filter, setFilter] = useState("all");
  if (selectedRisk?.prototypeFields) {
    return (
      <Card title="Proyeksi Risiko Armada" eyebrow="Prototype / Backend Required">
        <div className="risk-chart-frame empty-state">Histori, horizon, dan proyeksi risiko belum tersedia dari RAMS.</div>
      </Card>
    );
  }
  const data = [
    { name: "H-3", historical: 52, forecast: null, high: 1, medium: 4, contributor: "TS-002 C2", confidence: 78 },
    { name: "H-2", historical: 58, forecast: null, high: 1, medium: 5, contributor: "TS-002 C2", confidence: 80 },
    { name: "H-1", historical: 67, forecast: null, high: 2, medium: 5, contributor: "TS-001 C5", confidence: 83 },
    { name: "Hari ini", historical: selectedRisk?.riskScore ?? 84, forecast: selectedRisk?.riskScore ?? 84, high: 2, medium: 6, contributor: selectedRisk ? `${selectedRisk.trainsetId} C${selectedRisk.carNumber}` : "TS-001 C5", confidence: selectedRisk?.confidence ?? 86 },
    { name: "+1", historical: null, forecast: Math.min(96, (selectedRisk?.riskScore ?? 84) + 5), high: 3, medium: 7, contributor: selectedRisk ? `${selectedRisk.trainsetId} C${selectedRisk.carNumber}` : "TS-001 C5", confidence: selectedRisk?.confidence ?? 86 },
    { name: "+2", historical: null, forecast: Math.min(98, (selectedRisk?.riskScore ?? 84) + 8), high: 4, medium: 8, contributor: selectedRisk ? `${selectedRisk.trainsetId} C${selectedRisk.carNumber}` : "TS-001 C5", confidence: selectedRisk?.confidence ?? 86 },
    { name: "+3", historical: null, forecast: Math.max(58, (selectedRisk?.riskScore ?? 84) - 3), high: 3, medium: 6, contributor: selectedRisk ? `${selectedRisk.trainsetId} C${selectedRisk.carNumber}` : "TS-001 C5", confidence: selectedRisk?.confidence ?? 86 },
  ];

  return (
    <Card
      title="Proyeksi Risiko Armada"
      eyebrow="Historis dan prediksi 7 hari"
      action={
        <div className="predictive-chart-actions">
          <Select aria-label="Filter grafik risiko" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">Semua</option>
            <option value="high">Risiko Tinggi</option>
            <option value="medium">Risiko Sedang</option>
          </Select>
          <Button variant="ghost" className="table-mini-button" icon={<Info size={15} />} onClick={onOpenDetail}>Keterangan</Button>
        </div>
      }
    >
      <div className="risk-chart-frame">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 14, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: "#475569", fontWeight: 700 }} />
            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: "#475569", fontWeight: 700 }} />
            <ReferenceArea y1={60} y2={79} fill="#fef3c7" fillOpacity={0.34} />
            <ReferenceArea y1={80} y2={100} fill="#fee2e2" fillOpacity={0.34} />
            <ReferenceLine y={80} stroke="#dc2626" strokeDasharray="5 5" label={{ value: "Threshold tinggi", fill: "#991b1b", fontSize: 13, fontWeight: 800 }} />
            <Tooltip
              formatter={(value, name, entry) => {
                const payload = entry.payload as { contributor?: string; confidence?: number };
                const label = name === "forecast" ? "Prediksi risiko" : name === "historical" ? "Risiko historis" : name;
                return [`${value}% · ${payload.contributor ?? "-"} · confidence ${payload.confidence ?? "-"}%`, label];
              }}
              labelFormatter={(label) => `Periode ${label}`}
              contentStyle={{ borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}
            />
            <Legend wrapperStyle={{ fontSize: "14px", fontWeight: 800 }} formatter={(value) => value === "historical" ? "Historis" : value === "forecast" ? "Prediksi" : value} />
            {filter !== "high" ? <Area isAnimationActive={false} type="monotone" dataKey="medium" stroke="#d97706" fill="#fef3c7" name="Risiko Sedang" opacity={0.32} /> : null}
            {filter !== "medium" ? <Area isAnimationActive={false} type="monotone" dataKey="high" stroke="#dc2626" fill="#fee2e2" name="Risiko Tinggi" opacity={0.32} /> : null}
            <Line isAnimationActive={false} type="monotone" dataKey="historical" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} connectNulls={false} />
            <Line isAnimationActive={false} type="monotone" dataKey="forecast" stroke="#ef4444" strokeDasharray="7 6" strokeWidth={3} dot={{ r: 3 }} connectNulls={false} />
            <ReferenceDot x="+1" y={Math.min(96, (selectedRisk?.riskScore ?? 84) + 5)} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-caption predictive-threshold-caption">
        {selectedRisk
          ? `${selectedRisk.trainsetId} Gerbong ${selectedRisk.carNumber} diproyeksikan melewati threshold pada ${selectedRisk.thresholdTime}.`
          : "Risiko Tinggi meningkat pada akhir minggu, sehingga inspeksi Brake Cylinder C5 menjadi prioritas utama."}
      </p>
    </Card>
  );
}
