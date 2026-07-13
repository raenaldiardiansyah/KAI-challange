import type { RamsTelemetryResponse } from "@/types/api";
import { telemetryRamsDummy } from "../telemetryRamsDummy";

export const telemetryHistoryFixture: RamsTelemetryResponse = { ok: true, items: telemetryRamsDummy };
