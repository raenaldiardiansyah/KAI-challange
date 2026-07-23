import { describe, expect, it } from "vitest";
import { getCarIdentity, getTrainsetIdentity } from "../identityAdapter";

describe("identity adapter", () => {
  it("uses explicit backend-to-display mappings", () => {
    expect(getTrainsetIdentity("KA_DATA_DUMMY")).toMatchObject({ trainsetId: "KA_DATA_DUMMY", displayCode: "TS-001" });
    expect(getCarIdentity("KA_DATA_DUMMY", "M102401")).toEqual({
      trainsetId: "KA_DATA_DUMMY",
      carId: "M102401",
      displayCode: "C1",
      order: 1
    });
  });

  it("does not invent an array-based order for an unknown car", () => {
    expect(getCarIdentity("UNKNOWN", "CAR-X")).toMatchObject({ displayCode: "CAR-X", order: 0 });
  });
});
