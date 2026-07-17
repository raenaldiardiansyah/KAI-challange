import type { RamsFrontendStateDto } from "@/types/api";
import { alarmRecordsFixture } from "./alarms.fixture";
import { insightsFixture } from "./insights.fixture";
import { predictiveFixture } from "./predictive.fixture";
import { fixtureTrains, RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

const allCars = fixtureTrains.flatMap((train) => train.cars);
const trainsWithHealth = fixtureTrains.filter((train) => typeof train.health_score === "number");
const averageHealthScore = trainsWithHealth.length
  ? Math.round(trainsWithHealth.reduce((total, train) => total + (train.health_score ?? 0), 0) / trainsWithHealth.length)
  : 0;
const dataAvailabilityPercent = Math.round((allCars.filter((car) => car.status !== "OFFLINE").length / Math.max(allCars.length, 1)) * 1000) / 10;

export const frontendStateFixture: RamsFrontendStateDto = {
  ok: true,
  generated_at: RAMS_FIXTURE_GENERATED_AT,
  metrics: {
    total_trains: fixtureTrains.length,
    online_trains: fixtureTrains.filter((train) => train.status !== "OFFLINE").length,
    total_cars: allCars.length,
    online_cars: allCars.filter((car) => car.status !== "OFFLINE").length,
    active_alarms: alarmRecordsFixture.filter((alarm) => alarm.status === "ACTIVE").length,
    critical_alarms: alarmRecordsFixture.filter((alarm) => alarm.status === "ACTIVE" && alarm.severity === "CRITICAL").length,
    average_health_score: averageHealthScore,
    data_availability_percent: dataAvailabilityPercent
  },
  trains: fixtureTrains,
  alarms: alarmRecordsFixture.filter((alarm) => alarm.status === "ACTIVE"),
  insights: insightsFixture.items,
  llm_recommendations: [],
  predictive: predictiveFixture.items,
  positions: fixtureTrains.map((train) => ({
    trainset_id: train.trainset_id,
    display_name: train.display_name,
    latitude: train.position?.latitude ?? null,
    longitude: train.position?.longitude ?? null,
    speed_kph: train.position?.speed_kph ?? null,
    status: train.status,
    last_update: train.last_update
  }))
};
