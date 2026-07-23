import type { Alarm } from "@/types/alarm";

/**
 * Enriched alarm dummy data with varied dates, trainsets, and subsystems
 * so the report filter system can demonstrate meaningful filtering.
 *
 * Uses ISO date strings relative to a "current" reference of 2026-07-03.
 */
export const alarmDummy: Alarm[] = [
  // ── Today (2026-07-03) ──────────────────────────────────────
  {
    id: "ALM-001",
    trainsetId: "TS-001",
    carNumber: 5,
    subsystem: "Brake System",
    severity: "High",
    status: "Open",
    message: "Brake Cylinder pressure deviation above threshold",
    detectedAt: "2026-07-03T08:15:00+07:00",
    lastUpdate: "2026-07-03T08:45:00+07:00"
    ,title: "Brake Cylinder Pressure Deviation",
    signalName: "brake_cylinder",
    observedValue: 1.1,
    thresholdValue: 2.1,
    evidence: { observed_value: 1.1, threshold_value: 2.1, unit: "bar" },
    recommendation: "Periksa valve, jalur pneumatic, dan validasi pembacaan sensor.",
    diagnosticCases: ["LOCAL_BC_DEVIATION", "LOCAL_BRAKE_ABNORMAL"],
    affectedCars: [{ carId: "CAR-TS001-05", role: "alarm_car", confidence: "HIGH", bp: 4.2, bc: 1.1 }],
    diagnosticScope: "LOCAL",
    diagnosticConfidence: "HIGH",
    diagnosticEvidence: ["Brake Cylinder 1.1 bar berada di bawah ambang 2.1 bar.", "Brake Pipe stabil pada 4.2 bar."]
  },
  {
    id: "ALM-002",
    trainsetId: "TS-001",
    carNumber: 6,
    subsystem: "HVAC",
    severity: "Medium",
    status: "Acknowledged",
    message: "Cabin temperature above comfort band",
    detectedAt: "2026-07-03T09:02:00+07:00",
    lastUpdate: "2026-07-03T09:30:00+07:00"
  },
  {
    id: "ALM-003",
    trainsetId: "TS-003",
    carNumber: 7,
    subsystem: "Door",
    severity: "High",
    status: "Open",
    message: "Door controller telemetry delayed",
    detectedAt: "2026-07-03T07:56:00+07:00",
    lastUpdate: "2026-07-03T07:58:00+07:00"
  },
  {
    id: "ALM-004",
    trainsetId: "TS-002",
    carNumber: 3,
    subsystem: "Genset",
    severity: "Medium",
    status: "Open",
    message: "Genset voltage fluctuation detected",
    detectedAt: "2026-07-03T10:20:00+07:00",
    lastUpdate: "2026-07-03T10:35:00+07:00"
  },
  {
    id: "ALM-005",
    trainsetId: "TS-001",
    carNumber: 2,
    subsystem: "PIDS",
    severity: "Low",
    status: "Auto Cleared",
    message: "PIDS display sync delay",
    detectedAt: "2026-07-03T11:10:00+07:00",
    lastUpdate: "2026-07-03T11:12:00+07:00"
  },

  // ── Yesterday (2026-07-02) ──────────────────────────────────
  {
    id: "ALM-006",
    trainsetId: "TS-001",
    carNumber: 5,
    subsystem: "Brake System",
    severity: "High",
    status: "Closed",
    message: "Brake Pipe pressure drop below safe threshold",
    detectedAt: "2026-07-02T16:33:00+07:00",
    lastUpdate: "2026-07-02T16:55:00+07:00"
  },
  {
    id: "ALM-007",
    trainsetId: "TS-002",
    carNumber: 4,
    subsystem: "HVAC",
    severity: "Medium",
    status: "Closed",
    message: "Compressor overtemp warning",
    detectedAt: "2026-07-02T14:20:00+07:00",
    lastUpdate: "2026-07-02T14:50:00+07:00"
  },
  {
    id: "ALM-008",
    trainsetId: "TS-003",
    carNumber: 1,
    subsystem: "Communication",
    severity: "High",
    status: "Acknowledged",
    message: "Communication link intermittent",
    detectedAt: "2026-07-02T15:00:00+07:00",
    lastUpdate: "2026-07-02T15:30:00+07:00"
  },
  {
    id: "ALM-009",
    trainsetId: "TS-001",
    carNumber: 8,
    subsystem: "Door",
    severity: "Medium",
    status: "Closed",
    message: "Door sensor alignment warning",
    detectedAt: "2026-07-02T10:10:00+07:00",
    lastUpdate: "2026-07-02T10:45:00+07:00"
  },

  // ── This week earlier (2026-06-30, 2026-07-01) ──────────────
  {
    id: "ALM-010",
    trainsetId: "TS-002",
    carNumber: 2,
    subsystem: "Brake System",
    severity: "High",
    status: "Closed",
    message: "Emergency brake false trigger",
    detectedAt: "2026-07-01T08:00:00+07:00",
    lastUpdate: "2026-07-01T08:30:00+07:00"
  },
  {
    id: "ALM-011",
    trainsetId: "TS-001",
    carNumber: 3,
    subsystem: "Genset",
    severity: "Medium",
    status: "Closed",
    message: "Fuel level sensor drift",
    detectedAt: "2026-07-01T12:15:00+07:00",
    lastUpdate: "2026-07-01T12:45:00+07:00"
  },
  {
    id: "ALM-012",
    trainsetId: "TS-003",
    carNumber: 5,
    subsystem: "HVAC",
    severity: "Low",
    status: "Auto Cleared",
    message: "Filter maintenance reminder",
    detectedAt: "2026-07-01T06:00:00+07:00",
    lastUpdate: "2026-07-01T06:05:00+07:00"
  },
  {
    id: "ALM-013",
    trainsetId: "TS-001",
    carNumber: 4,
    subsystem: "Brake System",
    severity: "High",
    status: "Closed",
    message: "Brake pad wear level critical",
    detectedAt: "2026-06-30T14:30:00+07:00",
    lastUpdate: "2026-06-30T15:00:00+07:00"
  },
  {
    id: "ALM-014",
    trainsetId: "TS-002",
    carNumber: 6,
    subsystem: "Door",
    severity: "Medium",
    status: "Closed",
    message: "Door open/close cycle count exceeded",
    detectedAt: "2026-06-30T09:00:00+07:00",
    lastUpdate: "2026-06-30T09:20:00+07:00"
  },
  {
    id: "ALM-015",
    trainsetId: "TS-003",
    carNumber: 2,
    subsystem: "Communication",
    severity: "High",
    status: "Closed",
    message: "GPS module signal loss",
    detectedAt: "2026-06-30T11:45:00+07:00",
    lastUpdate: "2026-06-30T12:15:00+07:00"
  },

  // ── Earlier this month (June 2026) ──────────────────────────
  {
    id: "ALM-016",
    trainsetId: "TS-001",
    carNumber: 7,
    subsystem: "HVAC",
    severity: "High",
    status: "Closed",
    message: "Refrigerant pressure abnormal",
    detectedAt: "2026-06-25T10:00:00+07:00",
    lastUpdate: "2026-06-25T11:00:00+07:00"
  },
  {
    id: "ALM-017",
    trainsetId: "TS-002",
    carNumber: 1,
    subsystem: "Brake System",
    severity: "High",
    status: "Closed",
    message: "ABS module communication fault",
    detectedAt: "2026-06-22T08:30:00+07:00",
    lastUpdate: "2026-06-22T09:00:00+07:00"
  },
  {
    id: "ALM-018",
    trainsetId: "TS-003",
    carNumber: 3,
    subsystem: "Genset",
    severity: "Medium",
    status: "Closed",
    message: "Generator output undervoltage",
    detectedAt: "2026-06-20T13:00:00+07:00",
    lastUpdate: "2026-06-20T13:30:00+07:00"
  },
  {
    id: "ALM-019",
    trainsetId: "TS-001",
    carNumber: 9,
    subsystem: "PIDS",
    severity: "Low",
    status: "Auto Cleared",
    message: "Passenger info display glitch",
    detectedAt: "2026-06-18T07:00:00+07:00",
    lastUpdate: "2026-06-18T07:10:00+07:00"
  },
  {
    id: "ALM-020",
    trainsetId: "TS-002",
    carNumber: 5,
    subsystem: "Door",
    severity: "Medium",
    status: "Closed",
    message: "Door interlock micro-switch wear",
    detectedAt: "2026-06-15T16:00:00+07:00",
    lastUpdate: "2026-06-15T16:30:00+07:00"
  },
  {
    id: "ALM-021",
    trainsetId: "TS-001",
    carNumber: 1,
    subsystem: "Brake System",
    severity: "High",
    status: "Closed",
    message: "Brake disc temperature spike",
    detectedAt: "2026-06-12T11:20:00+07:00",
    lastUpdate: "2026-06-12T11:50:00+07:00"
  },
  {
    id: "ALM-022",
    trainsetId: "TS-003",
    carNumber: 6,
    subsystem: "HVAC",
    severity: "Medium",
    status: "Closed",
    message: "Evaporator fan vibration alert",
    detectedAt: "2026-06-10T09:40:00+07:00",
    lastUpdate: "2026-06-10T10:00:00+07:00"
  },
  {
    id: "ALM-023",
    trainsetId: "TS-002",
    carNumber: 8,
    subsystem: "Communication",
    severity: "Low",
    status: "Auto Cleared",
    message: "Wi-Fi AP reboot detected",
    detectedAt: "2026-06-08T14:00:00+07:00",
    lastUpdate: "2026-06-08T14:05:00+07:00"
  },

  // ── Earlier this year (before June) ─────────────────────────
  {
    id: "ALM-024",
    trainsetId: "TS-001",
    carNumber: 10,
    subsystem: "Brake System",
    severity: "High",
    status: "Closed",
    message: "Brake valve solenoid failure",
    detectedAt: "2026-05-15T08:00:00+07:00",
    lastUpdate: "2026-05-15T09:00:00+07:00"
  },
  {
    id: "ALM-025",
    trainsetId: "TS-003",
    carNumber: 4,
    subsystem: "Genset",
    severity: "Medium",
    status: "Closed",
    message: "Genset coolant temperature high",
    detectedAt: "2026-05-10T15:30:00+07:00",
    lastUpdate: "2026-05-10T16:00:00+07:00"
  },
  {
    id: "ALM-026",
    trainsetId: "TS-002",
    carNumber: 7,
    subsystem: "HVAC",
    severity: "High",
    status: "Closed",
    message: "Condenser fan motor failure",
    detectedAt: "2026-04-20T10:00:00+07:00",
    lastUpdate: "2026-04-20T11:30:00+07:00"
  },
  {
    id: "ALM-027",
    trainsetId: "TS-001",
    carNumber: 6,
    subsystem: "Door",
    severity: "Medium",
    status: "Closed",
    message: "Pneumatic door cylinder leak",
    detectedAt: "2026-04-05T07:45:00+07:00",
    lastUpdate: "2026-04-05T08:30:00+07:00"
  },
  {
    id: "ALM-028",
    trainsetId: "TS-003",
    carNumber: 8,
    subsystem: "PIDS",
    severity: "Low",
    status: "Closed",
    message: "LCD panel backlight flickering",
    detectedAt: "2026-03-12T13:00:00+07:00",
    lastUpdate: "2026-03-12T13:20:00+07:00"
  },
  {
    id: "ALM-029",
    trainsetId: "TS-002",
    carNumber: 3,
    subsystem: "Communication",
    severity: "High",
    status: "Closed",
    message: "Main radio transceiver offline",
    detectedAt: "2026-02-18T09:00:00+07:00",
    lastUpdate: "2026-02-18T10:00:00+07:00"
  },
  {
    id: "ALM-030",
    trainsetId: "TS-001",
    carNumber: 2,
    subsystem: "Brake System",
    severity: "High",
    status: "Closed",
    message: "Air compressor low output pressure",
    detectedAt: "2026-01-25T11:00:00+07:00",
    lastUpdate: "2026-01-25T12:00:00+07:00"
  }
];
