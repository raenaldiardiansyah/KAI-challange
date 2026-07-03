"use client";

import { Card } from "@/components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function RiskTrendChart() {
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
    <Card title="Tren Risiko Mingguan" eyebrow="Eskalasi masalah">
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            <Area type="monotone" dataKey="medium" stackId="1" stroke="#f59e0b" fill="#fef3c7" name="Sedang" />
            <Area type="monotone" dataKey="high" stackId="1" stroke="#ef4444" fill="#fee2e2" name="Tinggi" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
