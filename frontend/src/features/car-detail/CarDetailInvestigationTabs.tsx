"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { CarDataSensorTab } from "./CarDataSensorTab";
import { CarOperationalOverview } from "./CarOperationalOverview";
import { CarPriorityAction } from "./CarPriorityAction";
import type { CarDetail } from "@/types/car";
import type { TelemetrySeries } from "@/types/telemetry";
import type { RamsTelemetryDto } from "@/types/api";

type TabId = "summary" | "sensor" | "action";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "summary", label: "Ringkasan" },
  { id: "sensor", label: "Data Sensor" },
  { id: "action", label: "Tindakan" }
];

export function CarDetailInvestigationTabs({
  car,
  telemetry,
  telemetryRecords = [],
  filterContent,
  headerContent,
  trainsets = [],
  issueTrainsets = [],
  issueCars = []
}: {
  car: CarDetail;
  telemetry?: TelemetrySeries;
  telemetryRecords?: RamsTelemetryDto[];
  filterContent?: ReactNode;
  headerContent?: ReactNode;
  trainsets?: Array<{ id: string; name: string }>;
  issueTrainsets?: string[];
  issueCars?: number[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const tabList = (
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
  );

  return (
    <div className="car-detail-tabs">
      {filterContent ? (
        <div className="car-detail-filter-tabs-row">
          <div className="car-detail-filter-slot">{filterContent}</div>
          {tabList}
        </div>
      ) : (
        tabList
      )}

      {headerContent ? <div className="car-detail-tabs-context">{headerContent}</div> : null}

      <div className="tab-panel" role="tabpanel">
        {activeTab === "summary" ? (
          <CarOperationalOverview
            car={car}
            telemetry={telemetry}
            onOpenAction={() => setActiveTab("action")}
            onOpenDataSensor={() => setActiveTab("sensor")}
          />
        ) : null}

        {activeTab === "sensor" ? <CarDataSensorTab car={car} telemetry={telemetry} records={telemetryRecords} /> : null}

        {activeTab === "action" ? <CarPriorityAction car={car} onViewSensor={() => setActiveTab("sensor")} /> : null}
      </div>
    </div>
  );
}
