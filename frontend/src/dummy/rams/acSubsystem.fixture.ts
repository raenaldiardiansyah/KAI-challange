import type { RamsAcSubsystemResponse } from "@/types/api";
import { RAMS_FIXTURE_GENERATED_AT } from "./shared.fixture";

export const acSubsystemFixture: RamsAcSubsystemResponse = {
  ok: true,
  generated_at: RAMS_FIXTURE_GENERATED_AT,
  filters: { trainset: "KA_DATA_DUMMY", car: "T102401" },
  items: [{
    trainset: "KA_DATA_DUMMY",
    cars: [{
      car: "T102401",
      actual_humidity: 64,
      actual_temperature: 28.4,
      voltage_value_rst: { r: 220, s: 221, t: 222 },
      compressor_1_current_value_rst: { r: 5.8, s: 5.7, t: 5.9 },
      compressor_2_current_value_rst: { r: 0, s: 0, t: 0 },
      compressor_3_current_value_rst: { r: null, s: null, t: null }
    }]
  }]
};
