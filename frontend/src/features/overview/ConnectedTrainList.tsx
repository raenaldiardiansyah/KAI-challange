"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MetricDelta } from "@/components/ui/MetricDelta";
import { Modal } from "@/components/ui/Modal";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import type { Trainset } from "@/types/trainset";
import { formatDate } from "@/utils/formatDate";

export function ConnectedTrainList({ trainsets }: { trainsets: Trainset[] }) {
  const [open, setOpen] = useState(false);
  const onlineCount = trainsets.filter((trainset) => trainset.online).length;
  const alarmCount = trainsets.reduce((total, trainset) => total + trainset.alarmCount, 0);
  const averageHealth = trainsets.length
    ? Math.round(trainsets.reduce((total, trainset) => total + trainset.healthScore, 0) / trainsets.length)
    : 0;

  return (
    <>
      <Card
        title="Armada Terhubung"
        eyebrow="Preview operasional"
        action={<Button className="table-mini-button" variant="secondary" onClick={() => setOpen(true)}>Detail</Button>}
        className="overview-connected-compact-card"
      >
        <div className="overview-connected-compact">
          <div className="overview-connected-metrics">
            <span><strong>{onlineCount}/{trainsets.length}</strong><small>Online</small></span>
            <span><strong>{averageHealth}%</strong><small>Health</small></span>
            <span><strong>{alarmCount}</strong><small>Alarm</small></span>
          </div>
          <div className="overview-connected-mini-list">
            {trainsets.slice(0, 3).map((trainset) => (
              <button className="overview-connected-mini-row" key={trainset.id} onClick={() => setOpen(true)} type="button">
                <strong>{trainset.name}</strong>
                <StatusIndicator status={trainset.healthStatus} />
                <span>{trainset.healthScore}%</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Modal open={open} title="Armada Terhubung" onClose={() => setOpen(false)}>
        <div className="stack overview-connected-dialog">
          {trainsets.map((trainset) => (
            <div className="train-row overview-train-row" key={trainset.id}>
              <div className="overview-train-identity">
                <strong>{trainset.name}</strong>
                <p>{trainset.route} - {trainset.location}</p>
              </div>
              <StatusIndicator status={trainset.healthStatus} />
              <span className="percent-with-delta">
                <Badge label={`${trainset.alarmCount} alarm`} severity={trainset.alarmCount > 1 ? "High" : "Low"} />
                <MetricDelta value={trainset.alarmCount} delta={trainset.alarmCount > 1 ? 1 : -1} inverse compact unit="alarm" label="alarm" />
              </span>
              <span className="overview-train-date">{formatDate(trainset.lastUpdate)}</span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
