"use client";

import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function RiskTrendChart() {
  const [filter, setFilter] = useState("all");
  const data = [
    { name: "Sen", high: 1, medium: 4 },
    { name: "Sel", high: 1, medium: 5 },
    { name: "Rab", high: 2, medium: 5 },
    { name: "Kam", high: 2, medium: 6 },
    { name: "Jum", high: 3, medium: 7 },
    { name: "Sab", high: 4, medium: 8 },
    { name: "Min", high: 3, medium: 6 },
  ];

  return (
    <Card
      title="Perkembangan Risiko 7 Hari"
      eyebrow="Eskalasi risiko operasional"
      action={
        <Select aria-label="Filter grafik risiko" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">Semua</option>
          <option value="high">Risiko Tinggi</option>
          <option value="medium">Risiko Sedang</option>
        </Select>
      }
    >
      <p className="chart-helper-text">
        Grafik ini menunjukkan perubahan jumlah risiko Tinggi dan Sedang selama 7 hari terakhir untuk membantu menentukan prioritas inspeksi.
      </p>
      <div className="risk-chart-frame">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip
              formatter={(value, name) => [`${value} risiko`, name === "Tinggi" ? "Risiko Tinggi" : "Risiko Sedang"]}
              labelFormatter={(label) => `Hari ${label}`}
              contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
            />
            <Legend formatter={(value) => value === "Tinggi" ? "Risiko Tinggi" : "Risiko Sedang"} />
            {filter !== "high" ? (
              <Area isAnimationActive={false} type="monotone" dataKey="medium" stackId="1" stroke="#d97706" fill="#fef3c7" name="Sedang" />
            ) : null}
            {filter !== "medium" ? (
              <Area isAnimationActive={false} type="monotone" dataKey="high" stackId="1" stroke="#dc2626" fill="#fee2e2" name="Tinggi" />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-caption">
        Risiko Tinggi meningkat pada akhir minggu, sehingga inspeksi Brake Cylinder C5 menjadi prioritas utama.
      </p>
    </Card>
  );
}
