import type { RamsTelemetryResponse } from "@/types/api";
import { telemetryRamsDummy } from "../telemetryRamsDummy";

export const telemetryLatestFixture: RamsTelemetryResponse = {
  ok: true,
  items: telemetryRamsDummy.filter((record, index) => index % 2 === 0)
};
