import { describe, expect, it } from "vitest";
import { adaptFrontendState } from "../frontendStateAdapter";
import type { RamsFrontendStateDto } from "@/types/api";

const state: RamsFrontendStateDto = {
  ok: true,
  generated_at: "2026-07-09T03:32:00Z",
  metrics: {
    total_trains: 1,
    online_trains: 1,
    total_cars: 1,
    online_cars: 1,
    active_alarms: 0,
    critical_alarms: 0,
    average_health_score: 91,
    data_availability_percent: 100
  },
  trains: [{
    trainset_id: "KA_DATA_DUMMY",
    display_name: "KA DATA DUMMY",
    status: "ONLINE",
    health_score: 91,
    total_cars: 1,
    online_cars: 1,
    active_alarm_count: 0,
    last_update: "2026-07-09T03:30:00Z",
    position: { latitude: -7.5, longitude: 110.8, speed_kph: 63 },
    cars: [{ car_id: "M102401", status: "WARNING", health_score: 90, last_update: "2026-07-09T03:30:00Z", subsystems: [] }]
  }],
  alarms: [],
  insights: [],
  llm_recommendations: [],
  predictive: [],
  positions: [{ trainset_id: "KA_DATA_DUMMY", display_name: "KA DATA DUMMY", latitude: -7.5, longitude: 110.8, speed_kph: 63, status: "ONLINE", last_update: "2026-07-09T03:30:00Z" }]
};

describe("frontend state adapter", () => {
  it("takes KPI values from RAMS and hides unavailable trends", () => {
    const result = adaptFrontendState(state);
    expect(result.summary).toMatchObject({ totalTrainsets: 1, totalCars: 1, globalHealthScore: 91, predictiveRisks: 0, insightCount: 0, showTrends: false });
    expect(result.trainsets[0]).toMatchObject({ id: "KA_DATA_DUMMY", healthScore: 91 });
    expect(result.carInsights[0]).toMatchObject({ carNumber: 1, confidence: 0 });
  });
});
