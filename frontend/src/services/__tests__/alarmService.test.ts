import { beforeEach, describe, expect, it, vi } from "vitest";
import { acknowledgeAlarm, getAlarms, resolveAlarm } from "../alarmService";

const alarm = {
  id: 12,
  title: "Pressure",
  description: "Pressure warning",
  trainset_id: "KA_DATA_DUMMY",
  car_id: "M102401",
  subsystem: "PRESSURE",
  signal_name: "brake_cylinder",
  severity: "WARNING",
  status: "ACTIVE",
  observed_value: 2.2,
  threshold_value: 0.3,
  evidence: {},
  first_seen_at: "2026-07-09T01:00:00Z",
  last_seen_at: "2026-07-09T02:00:00Z"
};

describe("alarm service", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("loads documented alarm wrappers and never exposes AUTO_CLEARED", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const items = url.includes("status=ACTIVE") || url.includes("frontend%2Falarms") || url.includes("frontend/alarms") ? [alarm] : [];
      return new Response(JSON.stringify({ ok: true, items }), { status: 200 });
    });
    const result = await getAlarms();
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({ id: "12", trainsetCode: "TS-001", carId: "M102401", carNumber: 1, status: "Open" });
  });

  it("calls backend acknowledge and resolve mutations through the BFF", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      new Response(JSON.stringify({ ok: true, alarm }), { status: 200 })
    );
    await acknowledgeAlarm("12");
    await resolveAlarm("12");
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/rams/alarms/12/ack", expect.objectContaining({ method: "POST" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/rams/alarms/12/resolve", expect.objectContaining({ method: "POST" }));
  });
});
