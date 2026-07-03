"use client";

import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";

export function TelemetryTable() {
  const data = [
    { time: "2026-07-02 18:30:00", bp: 4.21, bc: 1.15, status: "Anomali" },
    { time: "2026-07-02 18:00:00", bp: 4.19, bc: 1.21, status: "Anomali" },
    { time: "2026-07-02 17:30:00", bp: 4.22, bc: 1.55, status: "Warning" },
    { time: "2026-07-02 17:00:00", bp: 4.20, bc: 2.30, status: "Normal" },
    { time: "2026-07-02 16:30:00", bp: 4.18, bc: 2.45, status: "Normal" },
  ];

  return (
    <Card title="Data Log Mentah (Raw Telemetry)" eyebrow="100 baris terakhir">
      <Table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Brake Pipe</th>
            <th>Brake Cylinder</th>
            <th>Threshold Brake Cylinder</th>
            <th>Status Data</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ background: row.status === "Anomali" ? "#fee2e2" : "inherit" }}>
              <td>{row.time}</td>
              <td>{row.bp} bar</td>
              <td style={{ color: row.status === "Anomali" ? "#b91c1c" : "inherit", fontWeight: row.status === "Anomali" ? "bold" : "normal" }}>
                {row.bc} bar
              </td>
              <td>2.00 bar</td>
              <td>
                <span style={{ 
                  color: row.status === "Anomali" ? "#b91c1c" : (row.status === "Warning" ? "#d97706" : "#10b981"),
                  fontWeight: "bold"
                }}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
