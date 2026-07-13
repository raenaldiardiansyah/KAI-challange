import type { RamsSubsystemDto, RamsTrainCarDto, RamsTrainDto } from "@/types/api";

export const RAMS_FIXTURE_GENERATED_AT = "2026-07-13T08:45:00.000Z";

export const fixtureTrainsetDefinitions = [
  { id: "KA_DATA_DUMMY", name: "KA DATA DUMMY", count: 10, lat: -6.9147, long: 107.6098, speed: 72 },
  { id: "KA_DUMMY_DATA", name: "KA DUMMY DATA", count: 9, lat: -7.2504, long: 110.2177, speed: 48 },
  { id: "KA_OFFLINE_DEMO", name: "KA OFFLINE DEMO", count: 8, lat: -7.557, long: 110.821, speed: null }
] as const;

export const fixtureCarIds: Record<string, string[]> = {
  KA_DATA_DUMMY: ["M102401", "M102402", "T102401", "D102404", "D102405", "D102406", "D102407", "D102408", "D102409", "D102410"],
  KA_DUMMY_DATA: ["K102401", "K102402", "K102403", "K102404", "K102405", "K102406", "K102407", "K102408", "K102409"],
  KA_OFFLINE_DEMO: ["O102401", "O102402", "O102403", "O102404", "O102405", "O102406", "O102407", "O102408"]
};

const carStatuses = ["WARNING", "ONLINE", "WARNING", "OFFLINE", "CRITICAL", "WATCH", "WATCH", "ONLINE", "ONLINE", "ONLINE"];

function subsystemFor(index: number): RamsSubsystemDto {
  if (index === 2) {
    return {
      subsystem: "AC",
      status: "WARNING",
      health_score: 74,
      active_alarm_count: 1,
      signal_count: 14,
      latest_values: { actual_temperature: 28.4, actual_humidity: 64 },
      last_update: RAMS_FIXTURE_GENERATED_AT
    };
  }
  if (index === 3) {
    return {
      subsystem: "PRESSURE",
      status: "OFFLINE",
      health_score: null,
      active_alarm_count: 0,
      signal_count: 0,
      latest_values: {},
      last_update: null
    };
  }
  const critical = index === 4;
  const warning = index === 0 || index === 5;
  return {
    subsystem: "PRESSURE",
    status: critical ? "CRITICAL" : warning ? "WARNING" : "ONLINE",
    health_score: critical ? 38 : warning ? 72 : 94,
    active_alarm_count: critical || warning ? 1 : 0,
    signal_count: 2,
    latest_values: {
      brake_pipe: critical ? 3.6 : warning ? 4.2 : 4.9,
      brake_cylinder: critical ? 0.8 : warning ? 1.1 : 2.2
    },
    last_update: RAMS_FIXTURE_GENERATED_AT
  };
}

export function buildFixtureCar(trainsetId: string, carId: string, index: number): RamsTrainCarDto {
  const status = trainsetId === "KA_OFFLINE_DEMO" ? "OFFLINE" : carStatuses[index] ?? "ONLINE";
  const subsystem = subsystemFor(index);
  return {
    car_id: carId,
    status,
    health_score: status === "OFFLINE" ? null : subsystem.health_score,
    last_update: status === "OFFLINE" ? null : RAMS_FIXTURE_GENERATED_AT,
    subsystems: index === 8 ? [] : [subsystem]
  };
}

export const fixtureTrains: RamsTrainDto[] = fixtureTrainsetDefinitions.map((definition, trainIndex) => {
  const cars = fixtureCarIds[definition.id].map((carId, index) => buildFixtureCar(definition.id, carId, index));
  const onlineCars = cars.filter((car) => car.status !== "OFFLINE").length;
  return {
    trainset_id: definition.id,
    display_name: definition.name,
    status: trainIndex === 2 ? "OFFLINE" : trainIndex === 0 ? "WARNING" : "ONLINE",
    health_score: trainIndex === 2 ? 48 : trainIndex === 0 ? 68 : 82,
    total_cars: cars.length,
    online_cars: onlineCars,
    active_alarm_count: trainIndex === 0 ? 3 : trainIndex === 1 ? 1 : 0,
    last_update: trainIndex === 2 ? null : RAMS_FIXTURE_GENERATED_AT,
    position: { latitude: definition.lat, longitude: definition.long, speed_kph: definition.speed },
    cars
  };
});
