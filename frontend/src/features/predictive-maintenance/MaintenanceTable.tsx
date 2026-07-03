import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import type { MaintenanceRisk } from "@/types/maintenance";

export function MaintenanceTable({ risks }: { risks: MaintenanceRisk[] }) {
  return (
    <Card title="Antrean Pemeliharaan (Queue)" eyebrow="Berdasarkan tingkat risiko">
      <Table>
        <thead><tr><th>Aset</th><th>Subsistem</th><th>Risiko</th><th>TTW (Estimasi Waktu Menuju Peringatan)</th><th>Rekomendasi</th></tr></thead>
        <tbody>
          {risks.map((risk) => (
            <tr key={risk.id}>
              <td>{risk.trainsetId} Gerbong {risk.carNumber}</td>
              <td>{risk.subsystem}</td>
              <td><Badge label={risk.severity} severity={risk.severity} /></td>
              <td><span style={{ fontWeight: "bold", color: risk.severity === "High" ? "#b91c1c" : "inherit" }}>{risk.timeToWarning}</span></td>
              <td>{risk.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
