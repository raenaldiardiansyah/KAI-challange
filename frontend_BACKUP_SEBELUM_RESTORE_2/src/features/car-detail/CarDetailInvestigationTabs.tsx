"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { CarPriorityAction } from "./CarPriorityAction";
import { CarSensorPanel } from "./CarSensorPanel";
import { CarSubsystemStatus } from "./CarSubsystemStatus";
import { TelemetryChart } from "@/features/telemetry/TelemetryChart";
import { TelemetryFilter } from "@/features/telemetry/TelemetryFilter";
import { TelemetryTable } from "@/features/telemetry/TelemetryTable";
import type { CarDetail } from "@/types/car";
import type { TelemetrySeries } from "@/types/telemetry";

type TabId = "overview" | "evidence" | "telemetry" | "action";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "evidence", label: "Evidence Sensor" },
  { id: "telemetry", label: "Telemetry" },
  { id: "action", label: "Tindakan" }
];

export function CarDetailInvestigationTabs({
  car,
  telemetry,
  trainsets = [],
  issueTrainsets = [],
  issueCars = []
}: {
  car: CarDetail;
  telemetry?: TelemetrySeries;
  trainsets?: Array<{ id: string; name: string }>;
  issueTrainsets?: string[];
  issueCars?: number[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const latestPoint = telemetry?.points.at(-1);
  const thresholdMinBc = 2;
  const medianBc = 2.3;
  const currentBc = latestPoint?.brakeCylinderBar ?? car.brakeCylinderBar;
  const currentBp = latestPoint?.brakePipeBar ?? car.brakePipeBar;
  const deviation = useMemo(() => Math.max(0, medianBc - currentBc), [currentBc]);
  const isAnomaly = currentBc < thresholdMinBc;

  return (
    <div className="car-detail-tabs">
      <div className="tab-list" role="tablist" aria-label="Investigasi gerbong">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-panel" role="tabpanel">
        {activeTab === "overview" ? <CarSubsystemStatus car={car} /> : null}

        {activeTab === "evidence" ? <CarSensorPanel car={car} /> : null}

        {activeTab === "telemetry" ? (
          <div className="stack">
            <TelemetryFilter />
            {telemetry ? (
              <div className="telemetry-investigation-grid">
                <TelemetryChart series={telemetry} />
                <Card title="Threshold Comparison" eyebrow="Brake Pipe/Brake Cylinder saat ini">
                  <div className="threshold-grid">
                    <div className="threshold-cell">
                      <span>Brake Pipe</span>
                      <strong>{currentBp.toFixed(2)} bar</strong>
                      <small>Stabil</small>
                    </div>
                    <div className={isAnomaly ? "threshold-cell alert" : "threshold-cell"}>
                      <span>Brake Cylinder</span>
                      <strong>{currentBc.toFixed(2)} bar</strong>
                      <small>{isAnomaly ? "Di bawah threshold" : "Normal"}</small>
                    </div>
                    <div className="threshold-cell">
                      <span>Median BC Armada</span>
                      <strong>{medianBc.toFixed(2)} bar</strong>
                      <small>Pembanding</small>
                    </div>
                    <div className={deviation > 0.5 ? "threshold-cell alert" : "threshold-cell"}>
                      <span>Deviasi BC</span>
                      <strong>{deviation.toFixed(2)} bar</strong>
                      <small>Threshold deviasi 0.50 bar</small>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card title="Telemetry belum tersedia" eyebrow={`${car.trainsetId} - Gerbong ${car.carNumber}`}>
                <p className="natural-text">Data telemetry untuk gerbong ini belum tersedia dari service.</p>
              </Card>
            )}
            <TelemetryTable />
          </div>
        ) : null}

        {activeTab === "action" ? <CarPriorityAction onViewEvidence={() => setActiveTab("evidence")} /> : null}
      </div>
    </div>
  );
}
