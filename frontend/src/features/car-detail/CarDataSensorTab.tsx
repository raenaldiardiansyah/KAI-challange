"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { TelemetryTable } from "@/features/telemetry/TelemetryTable";
import type { CarDetail } from "@/types/car";
import type { TelemetrySeries } from "@/types/telemetry";
import type { RamsTelemetryDto } from "@/types/api";
import { adaptTelemetryRecords } from "@/adapters/telemetryAdapter";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CarDataSensorTabProps = {
  car: CarDetail;
  telemetry?: TelemetrySeries;
  records?: RamsTelemetryDto[];
};

const timeRanges = ["1 jam", "6 jam", "24 jam", "7 hari"];
const normalBrakeCylinder = "2.1-2.4 bar";
const normalBrakePipe = "4.0-4.5 bar";

export function CarDataSensorTab({ car, telemetry, records = [] }: CarDataSensorTabProps) {
  const liveData = Boolean(car.backendCarId);
  const carCode = car.backendCarId ?? car.id;
  const initialSubsystem = car.selectedSubsystemCode === "AC" ? "HVAC" : car.selectedSubsystemCode === "PRESSURE" ? "Brake System" : car.subsystems[0]?.subsystem ?? "Brake System";
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>(initialSubsystem);
  const [selectedRange, setSelectedRange] = useState("24 jam");
  const [showThreshold, setShowThreshold] = useState(true);
  const [showRawData, setShowRawData] = useState(false);
  const latestPoint = telemetry?.points.at(-1);
  const currentBrakeCylinder = latestPoint?.brakeCylinderBar ?? car.brakeCylinderBar;
  const currentBrakePipe = latestPoint?.brakePipeBar ?? car.brakePipeBar;
  const currentTemperature = latestPoint?.temperature ?? car.hvacTemperature;
  const rawViews = useMemo(() => adaptTelemetryRecords(records), [records]);
  const isAc = selectedSubsystem === "HVAC" || car.selectedSubsystemCode === "AC";
  const liveEvidenceRows = (car.sensorValues ?? []).map((sensor) => ({
    sensor: sensor.label,
    actual: sensor.value == null ? "Belum tersedia" : `${sensor.value}${sensor.unit ? ` ${sensor.unit}` : ""}`,
    normal: "Ambang tidak tersedia",
    deviation: "—",
    duration: "Prototype",
    time: sensor.updatedAt ?? "Belum tersedia",
    status: sensor.quality ?? car.dataStatus ?? "Belum tersedia"
  }));

  const prototypeEvidenceRows = useMemo(() => [
    {
      sensor: "Brake Cylinder",
      actual: `${currentBrakeCylinder.toFixed(1)} bar`,
      normal: normalBrakeCylinder,
      deviation: `${Math.round(((currentBrakeCylinder - 2.3) / 2.3) * 100)}%`,
      duration: currentBrakeCylinder < 2 ? "18 menit" : "0 menit",
      time: latestPoint?.timestamp ?? "terbaru",
      status: currentBrakeCylinder < 2 ? "Anomali" : "Normal"
    },
    {
      sensor: "Brake Pipe",
      actual: `${currentBrakePipe.toFixed(1)} bar`,
      normal: normalBrakePipe,
      deviation: `${Math.round(((currentBrakePipe - 4.2) / 4.2) * 100)}%`,
      duration: "0 menit",
      time: latestPoint?.timestamp ?? "terbaru",
      status: "Normal"
    },
    {
      sensor: "HVAC Temperature",
      actual: `${currentTemperature.toFixed(1)} C`,
      normal: "24-28 C",
      deviation: currentTemperature > 28 ? "tinggi" : "normal",
      duration: currentTemperature > 28 ? "9 menit" : "0 menit",
      time: latestPoint?.timestamp ?? "terbaru",
      status: currentTemperature > 28 ? "Pantau" : "Normal"
    },
    {
      sensor: "Genset Voltage",
      actual: `${car.gensetVoltage} V`,
      normal: "370-390 V",
      deviation: car.gensetVoltage === 0 ? "N/A" : `${Math.round(((car.gensetVoltage - 380) / 380) * 100)}%`,
      duration: "0 menit",
      time: latestPoint?.timestamp ?? "terbaru",
      status: car.gensetVoltage === 0 ? "Tidak aktif" : "Normal"
    }
  ], [car.gensetVoltage, currentBrakeCylinder, currentBrakePipe, currentTemperature, latestPoint?.timestamp]);
  const evidenceRows = liveData ? liveEvidenceRows : prototypeEvidenceRows;
  const chartData = useMemo(() => {
    return (telemetry?.points ?? []).map((point) => ({
      time: point.timestamp,
      "Brake Pipe": point.brakePipeBar,
      "Brake Cylinder": point.brakeCylinderBar,
      "Threshold Brake Cylinder": 2
    }));
  }, [telemetry?.points]);

  return (
    <div className="car-data-sensor-tab">
      <Card title="Grafik Telemetry Sensor" eyebrow={`${car.trainsetId} - ${carCode}`}>
        <div className="car-sensor-toolbar">
          <label>
            Subsistem
            <select value={selectedSubsystem} onChange={(event) => setSelectedSubsystem(event.target.value)}>
              {car.subsystems.map((subsystem) => (
                <option key={subsystem.subsystem} value={subsystem.subsystem}>{subsystem.subsystem}</option>
              ))}
            </select>
          </label>
          {!liveData ? <div className="sensor-range-control" aria-label="Rentang waktu Prototype">
            {timeRanges.map((range) => (
              <button
                className={selectedRange === range ? "active" : ""}
                key={range}
                onClick={() => setSelectedRange(range)}
                type="button"
              >
                {range}
              </button>
            ))}
          </div> : null}
          {!isAc ? <label className="sensor-threshold-toggle">
            <input checked={showThreshold} onChange={(event) => setShowThreshold(event.target.checked)} type="checkbox" />
            Threshold
          </label> : null}
        </div>

        <div className="car-data-sensor-grid">
          <div className="car-data-chart-panel">
            {telemetry && !isAc ? (
              <div className="car-data-telemetry-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 26, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" minTickGap={28} tick={{ fontSize: 12, fill: "#64748b" }} tickMargin={10} />
                    <YAxis domain={[0, 6]} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    {showThreshold ? (
                      <Line isAnimationActive={false} type="stepAfter" dataKey="Threshold Brake Cylinder" stroke="#64748b" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                    ) : null}
                    <Line isAnimationActive={false} type="monotone" dataKey="Brake Pipe" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    <Line isAnimationActive={false} type="monotone" dataKey="Brake Cylinder" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="car-data-empty-chart">
                {isAc ? "Sensor AC ditampilkan sebagai nilai aktual RAMS." : "Data telemetry belum tersedia untuk sensor ini."}
              </div>
            )}
          </div>
          <div className="threshold-grid car-data-thresholds">
            <div className="threshold-cell">
              <span>Sensor dipilih</span>
              <strong>{selectedSubsystem}</strong>
              <small>{selectedRange}</small>
            </div>
            {isAc ? (car.sensorValues ?? []).slice(0, 7).map((sensor) => (
              <div className="threshold-cell" key={sensor.key}>
                <span>{sensor.label}</span>
                <strong>{sensor.value == null ? "Belum tersedia" : `${sensor.value}${sensor.unit ? ` ${sensor.unit}` : ""}`}</strong>
                <small>{sensor.quality ?? car.dataStatus ?? "Belum tersedia"}</small>
              </div>
            )) : <><div className={currentBrakeCylinder < 2 ? "threshold-cell alert" : "threshold-cell"}>
              <span>Brake Cylinder</span>
              <strong>{currentBrakeCylinder.toFixed(2)} bar</strong>
              <small>{showThreshold ? `Normal ${normalBrakeCylinder}` : "Threshold disembunyikan"}</small>
            </div>
            <div className="threshold-cell">
              <span>Brake Pipe</span>
              <strong>{currentBrakePipe.toFixed(2)} bar</strong>
              <small>{showThreshold ? `Normal ${normalBrakePipe}` : "Threshold disembunyikan"}</small>
            </div>
            </>}
            <button className="compare-car-button" type="button">Bandingkan Gerbong</button>
          </div>
        </div>
      </Card>

      <Card title="Tabel Evidence Sensor" eyebrow="Nilai aktual, normal, deviasi, durasi">
        <div className="car-sensor-evidence-table">
          <div className="car-sensor-evidence-head">
            <span>Sensor</span>
            <span>Aktual</span>
            <span>Normal</span>
            <span>Deviasi</span>
            <span>Durasi</span>
            <span>Waktu</span>
            <span>Status</span>
          </div>
          {evidenceRows.map((row) => (
            <button
              className={row.status === "Anomali" ? "car-sensor-evidence-row alert" : "car-sensor-evidence-row"}
              key={row.sensor}
              onClick={() => setSelectedSubsystem(row.sensor.includes("Brake") ? "Brake System" : selectedSubsystem)}
              type="button"
            >
              <span>{row.sensor}</span>
              <strong>{row.actual}</strong>
              <span>{row.normal}</span>
              <strong>{row.deviation}</strong>
              <span>{row.duration}</span>
              <span>{row.time}</span>
              <em>{row.status}</em>
            </button>
          ))}
        </div>
        <div className="action-row">
          <button className="secondary-inline-button" onClick={() => setShowRawData((current) => !current)} type="button">
            {showRawData ? "Sembunyikan Data Mentah" : "Lihat Data Mentah"}
          </button>
        </div>
        {showRawData ? <TelemetryTable records={rawViews} /> : null}
      </Card>
    </div>
  );
}
