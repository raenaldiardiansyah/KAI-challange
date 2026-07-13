import type { DataMode } from "./dataMode";
import { createRamsFixtureResult, requestRams, type RamsApiResult, type RamsRequestOptions } from "./ramsApiClient";

export async function loadRams<T>(
  mode: DataMode,
  path: string,
  fixture: T,
  options: RamsRequestOptions = {}
): Promise<RamsApiResult<T>> {
  return mode === "dummy" ? createRamsFixtureResult(fixture) : requestRams<T>(path, options);
}
