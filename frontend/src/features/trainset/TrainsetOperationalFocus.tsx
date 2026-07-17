"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Insight } from "@/types/insight";
import type { Trainset } from "@/types/trainset";

type TrainsetOperationalFocusProps = {
  trainset: Trainset;
  carsInsights: Insight[];
};

const statusLabels = [
  { key: "critical", label: "Critical", tone: "danger" },
  { key: "warning", label: "Warning", tone: "warning" },
  { key: "watch", label: "Watch", tone: "info" },
  { key: "offline", label: "Offline", tone: "neutral" }
] as const;

export function TrainsetOperationalFocus({ trainset, carsInsights }: TrainsetOperationalFocusProps) {
  const [open, setOpen] = useState(false);
  const breakdown = trainset.healthBreakdown;
  const priorityEvents = [...carsInsights]
    .filter((insight) => insight.severity !== "Normal")
    .sort((left, right) => left.healthScore - right.healthScore)
    .slice(0, 4);
  const primary = priorityEvents[0] ?? carsInsights[0];
  const degradedCount = (breakdown?.critical ?? 0) + (breakdown?.warning ?? 0) + (breakdown?.watch ?? 0);

  return (
    <>
      <Card
        title="Fokus Operasional Armada"
        eyebrow="Ringkasan event & tindakan"
        action={<Button className="table-mini-button" variant="secondary" onClick={() => setOpen(true)}>Buka Detail</Button>}
        className="trainset-operational-compact-card"
      >
        <div className="trainset-operational-compact">
          <span><strong>{degradedCount}</strong><small>Gerbong perlu perhatian</small></span>
          <span><strong>{priorityEvents.length}</strong><small>Event aktif</small></span>
          <span><strong>{primary ? `C${primary.carNumber}` : "-"}</strong><small>{primary?.subsystem ?? "Tidak ada prioritas"}</small></span>
          <p>{primary?.recommendation ?? "Armada dalam kondisi operasional normal."}</p>
        </div>
      </Card>

      <Modal open={open} title="Fokus Operasional Armada" onClose={() => setOpen(false)}>
        <div className="trainset-operational-focus trainset-operational-focus-dialog">
          <section className="trainset-status-distribution" aria-label="Status distribution">
            <span className="section-mini-title">Status Distribution</span>
            {statusLabels.map((item) => {
              const value = breakdown?.[item.key] ?? 0;
              const width = Math.max((value / Math.max(trainset.totalCars, 1)) * 100, value > 0 ? 10 : 3);
              return (
                <div className="trainset-status-row" key={item.key}>
                  <span>{item.label}</span>
                  <i><b className={`tone-${item.tone}`} style={{ width: `${width}%` }} /></i>
                  <strong>{value}</strong>
                </div>
              );
            })}
          </section>

          <section className="trainset-event-timeline" aria-label="Active events timeline">
            <span className="section-mini-title">Active Events Timeline</span>
            {priorityEvents.length ? priorityEvents.map((event, index) => (
              <Link
                href={`/car-detail?trainset=${encodeURIComponent(event.trainsetId)}&car=${event.carId ?? event.carNumber}&subsystem=${encodeURIComponent(event.subsystem)}`}
                className="trainset-event-row"
                key={event.id}
              >
                <small>{index === 0 ? "Prioritas" : `Event ${index + 1}`}</small>
                <strong>C{event.carNumber} - {event.subsystem}</strong>
                <span>{event.diagnosis}</span>
              </Link>
            )) : (
              <p className="trainset-empty-copy">Tidak ada event aktif pada armada ini.</p>
            )}
          </section>

          <section className="trainset-action-focus" aria-label="Predictive maintenance focus">
            <span className="section-mini-title">Predictive Maintenance Focus</span>
            {primary ? (
              <>
                <div className="trainset-action-head">
                  <strong>C{primary.carNumber} - {primary.subsystem}</strong>
                  <Badge label={primary.severity === "Normal" ? "Pantau" : primary.severity} severity={primary.severity} />
                </div>
                <p>{primary.recommendation}</p>
                <div className="trainset-action-buttons">
                  <Link className="button button-secondary table-mini-button" href={`/car-detail?trainset=${encodeURIComponent(primary.trainsetId)}&car=${primary.carId ?? primary.carNumber}&subsystem=${encodeURIComponent(primary.subsystem)}`}>
                    Lihat Evidence
                  </Link>
                  <Link className="button table-mini-button" href={`/work-order?trainset=${encodeURIComponent(primary.trainsetId)}&car=${primary.carNumber}&subsystem=${encodeURIComponent(primary.subsystem)}&source=trainset`}>
                    Buat SPK
                  </Link>
                </div>
              </>
            ) : (
              <p className="trainset-empty-copy">Rekomendasi prediktif belum tersedia.</p>
            )}
          </section>
        </div>
      </Modal>
    </>
  );
}
