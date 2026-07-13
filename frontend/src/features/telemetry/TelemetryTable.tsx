"use client";

import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import type { TelemetrySeries } from "@/types/telemetry";

export function TelemetryTable({ series }: { series?: TelemetrySeries }) {
  const data = (series?.points ?? []).slice(-100).reverse().map((point) => ({
    time: point.timestamp,
    bp: point.brakePipeBar,
    bc: point.brakeCylinderBar,
    status: "Terekam"
  }));

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
            <tr key={`${row.time}-${i}`}>
              <td>{row.time}</td>
              <td>{row.bp} bar</td>
              <td>{row.bc} bar</td>
              <td>Prototype</td>
              <td><span style={{ color: "#10b981", fontWeight: "bold" }}>{row.status}</span></td>
            </tr>
          ))}
          {data.length === 0 ? <tr><td colSpan={5}>Data telemetry belum tersedia.</td></tr> : null}
        </tbody>
      </Table>
    </Card>
  );
}
