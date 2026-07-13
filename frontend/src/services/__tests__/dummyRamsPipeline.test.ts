import { afterEach, describe, expect, it, vi } from "vitest";
import {
  acSubsystemFixture,
  activeAlarmsFixture,
  authUsersFixture,
  frontendMapsFixture,
  frontendStateFixture,
  frontendTrainsetsFixture,
  pressureBrakeFixture,
  telemetryHistoryFixture,
  trainsetsFixture
} from "@/dummy/rams";
import { getCarIdentity } from "@/adapters/identityAdapter";
import { getOverviewData } from "../overviewService";
import { getTrainsetPageData } from "../trainsetService";
import { getCarPageData } from "../carDetailService";
import { getAlarms } from "../alarmService";
import { getInsights } from "../insightService";
import { getMaintenanceRisks } from "../maintenanceService";
import { getLiveMonitoringData } from "../mapService";
import { getTelemetryData } from "../telemetryService";
import { getSystemStatus } from "../systemService";
import { getRules, getUsers } from "../adminService";

describe("RAMS-shaped Dummy pipeline", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("preserves documented wrappers and explicit C1-C10 identity mapping", () => {
    expect(trainsetsFixture).toMatchObject({ ok: true, trains: expect.any(Array) });
    expect(frontendTrainsetsFixture).toMatchObject({ ok: true, total: 3, limit: 1000, offset: 0, items: expect.any(Array) });
    expect(frontendMapsFixture).toMatchObject({ ok: true, items: expect.any(Array) });
    expect(activeAlarmsFixture).toMatchObject({ ok: true, items: expect.any(Array) });
    expect(Array.isArray(authUsersFixture)).toBe(true);

    const primaryCars = trainsetsFixture.trains[0].cars;
    expect(primaryCars).toHaveLength(10);
    expect(primaryCars.map((car) => getCarIdentity("KA_DATA_DUMMY", car.car_id).displayCode)).toEqual([
      "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"
    ]);
  });

  it("contains defensive variants and complete AC/Pressure endpoint fields", () => {
    expect(trainsetsFixture.trains.flatMap((train) => train.cars)).toEqual(expect.arrayContaining([
      expect.objectContaining({ status: "OFFLINE", health_score: null }),
      expect.objectContaining({ subsystems: [] })
    ]));
    expect(telemetryHistoryFixture.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ quality_status: "BAD" }),
      expect.objectContaining({ car_id: "UNKNOWN-CAR", value: null, source_topic: null })
    ]));
    expect(frontendMapsFixture.items).toEqual(expect.arrayContaining([expect.objectContaining({ speed: null })]));
    expect(acSubsystemFixture.items[0].cars[0]).toMatchObject({
      compressor_1_current_value_rst: { r: 5.8, s: 5.7, t: 5.9 },
      compressor_2_current_value_rst: { r: 0, s: 0, t: 0 },
      compressor_3_current_value_rst: { r: null, s: null, t: null }
    });
    expect(pressureBrakeFixture.items[0].cars).toEqual(expect.arrayContaining([
      expect.objectContaining({ car: "D102405", bp: 3.6, bc: 0.8 })
    ]));
  });

  it("runs every RAMS-backed page through services and adapters without fetch", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const [overview, trainsets, alarms, insights, predictive, maps, telemetry, system, rules, users] = await Promise.all([
      getOverviewData(undefined, "dummy"),
      getTrainsetPageData(undefined, "dummy"),
      getAlarms(undefined, "dummy"),
      getInsights(undefined, "dummy"),
      getMaintenanceRisks(undefined, "dummy"),
      getLiveMonitoringData(undefined, "dummy"),
      getTelemetryData({}, undefined, "dummy"),
      getSystemStatus(undefined, "dummy"),
      getRules(undefined, "dummy"),
      getUsers(undefined, "dummy")
    ]);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect([overview, trainsets, alarms, insights, predictive, maps, telemetry, system, rules, users].every((result) => result.source === "dummy")).toBe(true);
    expect(overview.data.summary.totalCars).toBe(frontendStateFixture.metrics.total_cars);
    expect(overview.data.trainsets.find((trainset) => trainset.id === "KA_DATA_DUMMY")).toMatchObject({ online: true, healthStatus: "Warning" });
    expect(overview.data.carInsights).toHaveLength(10);
    expect(overview.data.carInsights.every((insight) => insight.trainsetId === "KA_DATA_DUMMY")).toBe(true);
    expect(overview.data.trainsetCompositions.map((composition) => composition.totalCars)).toEqual([10, 9, 8]);
    expect(overview.data.trainsetCompositions[1].carInsights.every((insight) => insight.trainsetId === "KA_DUMMY_DATA")).toBe(true);
    expect(trainsets.data.trainsets).toHaveLength(3);
    expect(alarms.data.some((alarm) => alarm.diagnosticEvidence?.length)).toBe(true);
    expect(alarms.data.every((alarm) => !Number.isNaN(new Date(alarm.detectedAt).getTime()))).toBe(true);
    expect(insights.data[0]).toMatchObject({ generatedBy: "template", sourceEventId: 12, confidence: 86 });
    expect(predictive.data[0]).toMatchObject({ predictionType: "BREATHER_VALVE_FAIL", riskScore: 84 });
    expect(maps.data.points.some((point) => point.speed == null)).toBe(true);
    expect(telemetry.data.records.some((record) => record.quality_status === "BAD")).toBe(true);
    expect(system.data.mqttConnected).toBe(true);
    expect(rules.data[0].rule_id).toBe("PRESS-R001");
    expect(users.data.map((user) => user.role)).toEqual(["ADMIN", "TECHNICIAN", "VIEWER"]);
  });

  it("merges car health, condition, AC and Pressure fixtures into the existing Gerbong view model", async () => {
    const ac = await getCarPageData({ trainsetId: "TS-001", carId: "C3", subsystem: "HVAC" }, undefined, "dummy");
    const pressure = await getCarPageData({ trainsetId: "TS-001", carId: "C5", subsystem: "Brake System" }, undefined, "dummy");
    const acCar = ac.data.cars.find((car) => car.backendCarId === "T102401");
    const pressureCar = pressure.data.cars.find((car) => car.backendCarId === "D102405");

    expect(acCar?.sensorValues).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "compressor_3_current_t", value: null, unit: "A" })
    ]));
    expect(pressureCar).toMatchObject({ brakePipeBar: 3.6, brakeCylinderBar: 0.8, primaryRuleId: "PRESS-R001" });
  });
});
