"use client";

import { Card } from "@/components/ui/Card";
import type { CarDetail } from "@/types/car";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function CarSensorPanel({ car }: { car: CarDetail }) {
  const data = Array.from({ length: 24 }, (_, i) => {
    const hour = (i + 1).toString().padStart(2, "0");
    const stableWave = Math.sin(i * 0.8);
    let bcValue = 2.3 + stableWave * 0.08;
    const bpValue = 4.2 + Math.cos(i * 0.6) * 0.04;

    if (i > 18) {
      bcValue = 1.1 + Math.sin(i * 1.2) * 0.12;
    }

    return {
      time: `${hour}:00`,
      "Brake Pipe": bpValue.toFixed(1),
      "Brake Cylinder": bcValue.toFixed(1)
    };
  });

  return (
    <Card title="Panel Evidence Sensor" eyebrow="Tren Brake Pipe & Brake Cylinder (24 Jam)">
      <div className="sensor-evidence-layout">
        <div className="stack">
          <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Brake Pipe (BP) saat ini</span>
            <strong style={{ fontSize: "20px" }}>{car.brakePipeBar} bar</strong>
            <span style={{ fontSize: "12px", color: "#10b981", display: "block", marginTop: "4px" }}>Normal (Stabil)</span>
          </div>
          <div style={{ background: "#fee2e2", padding: "12px", borderRadius: "8px", border: "1px solid #fecaca" }}>
            <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Brake Cylinder (BC) saat ini</span>
            <strong style={{ fontSize: "20px", color: "#b91c1c" }}>{car.brakeCylinderBar} bar</strong>
            <span style={{ fontSize: "12px", color: "#b91c1c", display: "block", marginTop: "4px" }}>Deviasi Tinggi (-52%)</span>
          </div>
        </div>
        
        <div className="sensor-chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: "#64748b" }} tickMargin={10} />
              <YAxis domain={[0, 6]} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip 
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="Brake Pipe" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Brake Cylinder" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
