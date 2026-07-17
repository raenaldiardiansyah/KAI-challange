import type { RamsSubsystemDto, RamsTrainCarDto, RamsTrainDto } from "@/types/api";

export const RAMS_FIXTURE_GENERATED_AT = "2026-07-13T08:45:00.000Z";

export const fixtureTrainsetDefinitions = [
  { id: "KA_DATA_DUMMY", name: "Anggrek Lembah M02406", count: 10, lat: -6.9147, long: 107.6098, speed: 72, status: "WARNING", health: 68, alarms: 3 },
  { id: "KA_DUMMY_DATA", name: "Argo Wilis M02511", count: 9, lat: -7.2504, long: 110.2177, speed: 48, status: "ONLINE", health: 82, alarms: 1 },
  { id: "KA_OFFLINE_DEMO", name: "Lodaya M02103", count: 8, lat: -7.557, long: 110.821, speed: null, status: "OFFLINE", health: 48, alarms: 2 },
  { id: "KA_TAKSAKA_DEMO", name: "Taksaka M02308", count: 8, lat: -7.7956, long: 110.3695, speed: 84, status: "WATCH", health: 76, alarms: 1 },
  { id: "KA_MALIOBORO_DEMO", name: "Malioboro Ekspres M02014", count: 7, lat: -7.9819, long: 112.6265, speed: 62, status: "ONLINE", health: 88, alarms: 0 },
  { id: "KA_MUTIARA_DEMO", name: "Mutiara Selatan M01973", count: 8, lat: -7.3274, long: 108.2207, speed: 55, status: "STALE", health: 71, alarms: 1 },
  { id: "KA_SENJA_DEMO", name: "Senja Utama M01890", count: 7, lat: -6.2088, long: 106.8456, speed: 36, status: "ONLINE", health: 91, alarms: 0 },
  { id: "KA_GAJAYANA_DEMO", name: "Gajayana M01742", count: 7, lat: -7.9666, long: 112.6326, speed: 67, status: "WATCH", health: 79, alarms: 1 },
  { id: "KA_TURANGGA_DEMO", name: "Turangga M01621", count: 6, lat: -7.0051, long: 110.4381, speed: 74, status: "ONLINE", health: 86, alarms: 0 },
  { id: "KA_BIMA_DEMO", name: "BIMA M01517", count: 5, lat: -7.2575, long: 112.7521, speed: 58, status: "WARNING", health: 73, alarms: 2 }
] as const;

export const fixtureCarIds: Record<string, string[]> = {
  KA_DATA_DUMMY: ["M102401", "M102402", "T102401", "D102404", "D102405", "D102406", "D102407", "D102408", "D102409", "D102410"],
  KA_DUMMY_DATA: ["K102401", "K102402", "K102403", "K102404", "K102405", "K102406", "K102407", "K102408", "K102409"],
  KA_OFFLINE_DEMO: ["O102401", "O102402", "O102403", "O102404", "O102405", "O102406", "O102407", "O102408"],
  KA_TAKSAKA_DEMO: ["TAKSAKA01", "TAKSAKA02", "TAKSAKA03", "TAKSAKA04", "TAKSAKA05", "TAKSAKA06", "TAKSAKA07", "TAKSAKA08"],
  KA_MALIOBORO_DEMO: ["MALIOBORO01", "MALIOBORO02", "MALIOBORO03", "MALIOBORO04", "MALIOBORO05", "MALIOBORO06", "MALIOBORO07"],
  KA_MUTIARA_DEMO: ["MUTIARA01", "MUTIARA02", "MUTIARA03", "MUTIARA04", "MUTIARA05", "MUTIARA06", "MUTIARA07", "MUTIARA08"],
  KA_SENJA_DEMO: ["SENJA01", "SENJA02", "SENJA03", "SENJA04", "SENJA05", "SENJA06", "SENJA07"],
  KA_GAJAYANA_DEMO: ["GAJAYANA01", "GAJAYANA02", "GAJAYANA03", "GAJAYANA04", "GAJAYANA05", "GAJAYANA06", "GAJAYANA07"],
  KA_TURANGGA_DEMO: ["TURANGGA01", "TURANGGA02", "TURANGGA03", "TURANGGA04", "TURANGGA05", "TURANGGA06"],
  KA_BIMA_DEMO: ["BIMA01", "BIMA02", "BIMA03", "BIMA04", "BIMA05"]
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
    status: definition.status,
    health_score: definition.health,
    total_cars: cars.length,
    online_cars: onlineCars,
    active_alarm_count: definition.alarms,
    last_update: definition.status === "OFFLINE" ? null : RAMS_FIXTURE_GENERATED_AT,
    position: { latitude: definition.lat, longitude: definition.long, speed_kph: definition.speed },
    cars
  };
});
