import { ArrowsLeftRight, ClockCounterClockwise, DotsThree, Eye } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import Link from "next/link";
import { useState } from "react";
import type { PredictiveRiskView } from "./riskViewModel";

export function MaintenanceTable({
  risks,
  selectedId,
  onSelectRisk,
  onOpenDetail,
  onOpenEvidence,
  showAll = false
}: {
  risks: PredictiveRiskView[];
  selectedId?: string;
  onSelectRisk: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onOpenEvidence: (id: string) => void;
  showAll?: boolean;
}) {
  const [openMenuId, setOpenMenuId] = useState("");
  const visibleRisks = showAll ? risks : risks.slice(0, 5);

  return (
    <Card title="Antrean Pemeliharaan" eyebrow="Berdasarkan risiko dan estimasi TTW">
      <p className="table-helper-text">
        Antrean ini menampilkan aset yang perlu ditindaklanjuti berdasarkan tingkat risiko, estimasi waktu menuju peringatan, dan rekomendasi sistem.
      </p>
      <p className="ttw-note">
        TTW adalah estimasi waktu menuju peringatan atau kondisi yang membutuhkan inspeksi. Contoh: 12 jam berarti aset perlu diperiksa sebelum risiko meningkat.
      </p>
      <Table>
        <thead>
          <tr>
            <th>Aset</th>
            <th>Subsistem</th>
            <th>Risiko</th>
            <th>TTW</th>
            <th>Confidence</th>
            <th>Inspeksi</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {visibleRisks.map((risk) => (
            <tr
              key={risk.id}
              className={selectedId === risk.id ? "predictive-risk-row selected" : "predictive-risk-row"}
              onClick={() => onSelectRisk(risk.id)}
            >
              <td><strong>{risk.trainsetId}</strong><span>Gerbong {risk.carNumber}</span></td>
              <td>{risk.subsystem}</td>
              <td><Badge label={`${risk.riskScore}%`} severity={risk.severity} /></td>
              <td><strong className={risk.severity === "High" ? "danger-text" : ""}>{risk.timeToWarning}</strong></td>
              <td>{risk.confidence}%</td>
              <td>{risk.inspectionWindow}</td>
              <td>{risk.status}</td>
              <td onClick={(event) => event.stopPropagation()}>
                <div className="table-action-cluster">
                  <Button variant="ghost" className="table-mini-button" onClick={() => onOpenDetail(risk.id)}>Detail</Button>
                  <Button asChild className="table-mini-button predictive-spk-button">
                    <Link href={`/work-order?trainset=${risk.trainsetId}&car=${risk.carNumber}&subsystem=${encodeURIComponent(risk.subsystem)}`}>Buat SPK</Link>
                  </Button>
                  <button
                    aria-expanded={openMenuId === risk.id}
                    aria-label={`Tindakan lainnya untuk ${risk.trainsetId} Gerbong ${risk.carNumber}`}
                    className="predictive-row-menu-trigger"
                    onClick={() => setOpenMenuId(openMenuId === risk.id ? "" : risk.id)}
                    type="button"
                  >
                    <DotsThree size={18} weight="bold" />
                  </button>
                  {openMenuId === risk.id ? (
                    <div className="predictive-row-menu">
                      <button type="button" onClick={() => onOpenEvidence(risk.id)}><Eye size={15} />Lihat evidence</button>
                      <button type="button" onClick={() => onSelectRisk(risk.id)}><ArrowsLeftRight size={15} />Bandingkan aset</button>
                      <button type="button" onClick={() => onSelectRisk(risk.id)}><ClockCounterClockwise size={15} />Riwayat prediksi</button>
                    </div>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
          {visibleRisks.length === 0 ? (
            <tr>
              <td colSpan={8}>Tidak ada antrean yang sesuai filter.</td>
            </tr>
          ) : null}
        </tbody>
      </Table>
      {risks.length > visibleRisks.length ? (
        <div className="predictive-table-note">
          Menampilkan {visibleRisks.length} dari {risks.length} aset. Klik Lihat Semua untuk membuka antrean lengkap sesuai filter aktif.
        </div>
      ) : null}
    </Card>
  );
}
