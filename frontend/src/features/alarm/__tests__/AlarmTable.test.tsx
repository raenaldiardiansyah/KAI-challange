import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlarmTable } from "../AlarmTable";
import { alarmDummy } from "@/dummy/alarmDummy";

describe("AlarmTable", () => {
  it("renders alarm table with header columns", () => {
    render(<AlarmTable alarms={alarmDummy} />);

    const headers = ["Waktu", "Armada", "Gerbong", "Subsistem", "Pesan Alarm", "Tingkat", "Status", "Aksi"];
    for (const header of headers) {
      expect(screen.getByRole("columnheader", { name: header })).toBeInTheDocument();
    }
  });

  it("initially shows up to 10 alarm rows", () => {
    render(<AlarmTable alarms={alarmDummy} />);

    const tbody = screen.getAllByRole("rowgroup")[1]; // thead is first rowgroup
    const rows = within(tbody).getAllByRole("row");
    expect(rows).toHaveLength(10);
  });

  it("'Lihat lebih banyak' button shows more rows", async () => {
    const user = userEvent.setup();
    render(<AlarmTable alarms={alarmDummy} />);

    const button = screen.getByRole("button", { name: /lihat lebih banyak/i });
    await user.click(button);

    const tbody = screen.getAllByRole("rowgroup")[1];
    const rows = within(tbody).getAllByRole("row");
    expect(rows).toHaveLength(20);
  });

  it("clicking 'Acknowledge' on an Open alarm calls window.alert", async () => {
    const user = userEvent.setup();
    render(<AlarmTable alarms={alarmDummy} />);

    // ALM-001 is the first Open alarm
    const ackButtons = screen.getAllByRole("button", { name: /acknowledge/i });
    await user.click(ackButtons[0]);

    expect(globalThis.alert).toHaveBeenCalled();
  });

  it("clicking 'Evidence' calls router.push to /car-detail", async () => {
    const user = userEvent.setup();
    const pushMock = (globalThis as any).__mockRouterPush;
    render(<AlarmTable alarms={alarmDummy} />);

    const evidenceButtons = screen.getAllByRole("button", { name: /evidence/i });
    await user.click(evidenceButtons[0]);

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("/car-detail")
    );
  });

  it("clicking 'Buat SPK' calls router.push to /work-order", async () => {
    const user = userEvent.setup();
    const pushMock = (globalThis as any).__mockRouterPush;
    render(<AlarmTable alarms={alarmDummy} />);

    const spkButtons = screen.getAllByRole("button", { name: /buat spk/i });
    await user.click(spkButtons[0]);

    expect(pushMock).toHaveBeenCalledWith("/work-order");
  });

  it("clicking a row calls onSelectAlarm", async () => {
    const user = userEvent.setup();
    const onSelectAlarm = vi.fn();
    render(<AlarmTable alarms={alarmDummy} onSelectAlarm={onSelectAlarm} />);

    const tbody = screen.getAllByRole("rowgroup")[1];
    const firstRow = within(tbody).getAllByRole("row")[0];
    await user.click(firstRow);

    expect(onSelectAlarm).toHaveBeenCalledWith(alarmDummy[0].id);
  });
});
