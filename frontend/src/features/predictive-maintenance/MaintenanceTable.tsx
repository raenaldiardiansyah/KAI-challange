import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import Link from "next/link";
import type { MaintenanceRisk } from "@/types/maintenance";

export function MaintenanceTable({
  risks,
  selectedId,
  onSelectRisk
}: {
  risks: MaintenanceRisk[];
  selectedId?: string;
  onSelectRisk: (id: string) => void;
}) {
  return (
    <Card title="Antrean Pemeliharaan (Queue)" eyebrow="Berdasarkan tingkat risiko">
      <p className="table-helper-text">
        Antrean ini menampilkan aset yang perlu ditindaklanjuti berdasarkan tingkat risiko, estimasi waktu menuju peringatan, dan rekomendasi sistem.
      </p>
      <p className="ttw-note">
        TTW adalah estimasi waktu menuju peringatan atau kondisi yang membutuhkan inspeksi. Contoh: 12 jam berarti aset perlu diperiksa sebelum risiko meningkat.
      </p>
      <Table>
        <thead><tr><th>Aset</th><th>Subsistem</th><th>Risiko</th><th>TTW</th><th>Rekomendasi</th><th>Aksi</th></tr></thead>
        <tbody>
          {risks.map((risk) => (
            <tr
              key={risk.id}
              className={selectedId === risk.id ? "predictive-risk-row selected" : "predictive-risk-row"}
              onClick={() => onSelectRisk(risk.id)}
            >
              <td>{risk.trainsetId} Gerbong {risk.carNumber}</td>
              <td>{risk.subsystem}</td>
              <td><Badge label={risk.severity} severity={risk.severity} /></td>
              <td><span style={{ fontWeight: "bold", color: risk.severity === "High" ? "#b91c1c" : "inherit" }}>{risk.timeToWarning}</span></td>
              <td>{risk.recommendation}</td>
              <td onClick={(event) => event.stopPropagation()}>
                <div className="table-action-cluster">
                  <Button variant="ghost" className="table-mini-button" onClick={() => onSelectRisk(risk.id)}>Lihat Detail</Button>
                  <Button asChild variant="secondary" className="table-mini-button">
                    <Link href="/car-detail">Lihat Evidence</Link>
                  </Button>
                  <Button asChild className="table-mini-button">
                    <Link href="/work-order">Buat SPK</Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
