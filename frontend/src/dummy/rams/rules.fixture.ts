import type { RamsRulesResponse } from "@/types/api";
import { RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export const rulesFixture: RamsRulesResponse = {
  ok: true,
  filters: { subsystem: null, enabled: null, source: null, level: null },
  count: 2,
  items: [
    { id: 1, rule_id: "PRESS-R001", subsystem_ppt: "Pressure", subsystem_code: "PRESSURE", event_code: "BRAKE_PRESSURE_PRESENT", level: "WATCH", condition_expression: "PRESS.BrakeCylinder > 0.3", condition_json: { unit: "bar", value: 0.3, signal: "brake_cylinder", operator: ">" }, rule_type: "Context only", recommendation: "Review brake state/speed", validation_status: "Needs brake sequence", source: "official_document", enabled: true, created_at: "2026-07-13T07:00:00.000Z", updated_at: RAMS_FIXTURE_GENERATED_AT },
    { id: 2, rule_id: "PRESS-R002", subsystem_ppt: "Pressure", subsystem_code: "PRESSURE", event_code: "BRAKE_CYLINDER_PRESSURE_HIGH_BASIC", level: "WARNING", condition_expression: "PRESS.BrakeCylinder > 2.5", condition_json: { unit: "bar", value: 2.5, signal: "brake_cylinder", operator: ">" }, rule_type: "Starter", recommendation: "Review brake context/inter-car", validation_status: "Needs brake FMECA", source: "official_document", enabled: true, created_at: "2026-07-13T07:00:00.000Z", updated_at: RAMS_FIXTURE_GENERATED_AT }
  ]
};
