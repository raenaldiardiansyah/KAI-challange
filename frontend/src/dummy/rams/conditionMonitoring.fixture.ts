import type { RamsConditionMonitoringResponse, RamsRuleMatchDto } from "@/types/api";
import { fixtureTrains, RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

const availableRules: RamsRuleMatchDto[] = [
  { level: "WATCH", rule_id: "PRESS-R001", event_code: "BRAKE_PRESSURE_PRESENT", recommendation: "Review brake state and speed.", condition_expression: "PRESS.BrakeCylinder > 0.3", validation_status: "Needs brake sequence", enabled: true },
  { level: "WARNING", rule_id: "PRESS-R002", event_code: "BRAKE_CYLINDER_PRESSURE_HIGH_BASIC", recommendation: "Review brake context and inter-car values.", condition_expression: "PRESS.BrakeCylinder > 2.5", validation_status: "Needs brake FMECA", enabled: true }
];

export function conditionMonitoringFixture(trainsetId: string, carId: string): RamsConditionMonitoringResponse {
  const train = fixtureTrains.find((item) => item.trainset_id === trainsetId) ?? fixtureTrains[0];
  const car = train.cars.find((item) => item.car_id === carId) ?? train.cars[0];
  const pressure = car.subsystems.find((item) => item.subsystem === "PRESSURE");
  const bp = pressure?.latest_values.brake_pipe ?? null;
  const bc = pressure?.latest_values.brake_cylinder ?? null;
  const abnormal = pressure && pressure.status !== "ONLINE";
  return {
    ok: true,
    generated_at: RAMS_FIXTURE_GENERATED_AT,
    context: { trainset_id: train.trainset_id, car_id: car.car_id, subsystem: "PRESSURE" },
    health: {
      health_status: pressure?.status ?? "DATA_LIMITED",
      health_score: pressure?.health_score ?? null,
      data_status: pressure?.status === "OFFLINE" ? "OFFLINE" : pressure ? "ONLINE" : "NO_DATA",
      display_status: pressure?.status ?? "DATA_LIMITED",
      primary_rule_id: abnormal ? "PRESS-R001" : null,
      primary_event_code: abnormal ? "BRAKE_PRESSURE_PRESENT" : null,
      reason: abnormal ? "Pressure value is outside the demonstration rule." : "Pressure values are normal or unavailable.",
      last_update: pressure?.last_update ?? null,
      updated_at: RAMS_FIXTURE_GENERATED_AT
    },
    signals: {
      brake_pipe: { unit: "bar", label: "Brake Pipe", value: bp },
      brake_cylinder: { unit: "bar", label: "Brake Cylinder", value: bc }
    },
    matched_rules: abnormal ? [availableRules[0]] : [],
    available_rules: availableRules
  };
}
