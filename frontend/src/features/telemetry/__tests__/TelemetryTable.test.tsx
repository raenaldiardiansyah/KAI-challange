import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { adaptTelemetryRecords } from "@/adapters/telemetryAdapter";
import { telemetryRamsDummy } from "@/dummy/telemetryRamsDummy";
import { TelemetryTable } from "../TelemetryTable";

describe("TelemetryTable", () => {
  it("shows every primary RAMS telemetry field", () => {
    render(<TelemetryTable records={adaptTelemetryRecords(telemetryRamsDummy.slice(0, 1))} />);
    ["Waktu", "Trainset", "Gerbong", "Subsistem", "Signal", "Nilai", "Unit", "Kualitas"].forEach((name) => {
      expect(screen.getByRole("columnheader", { name })).toBeInTheDocument();
    });
    expect(screen.getByText("brake_pipe")).toBeInTheDocument();
    expect(screen.getByText("GOOD")).toBeInTheDocument();
  });

  it("expands only the selected row to show secondary backend fields", async () => {
    const user = userEvent.setup();
    render(<TelemetryTable records={adaptTelemetryRecords(telemetryRamsDummy.slice(0, 2))} />);
    const rows = within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row");
    await user.click(rows[0]);
    expect(screen.getByText("Trainset backend")).toBeInTheDocument();
    expect(screen.getByText("rams/KA_DATA_DUMMY/M102401/pressure")).toBeInTheDocument();
  });

  it("allows optional columns to be made visible", async () => {
    const user = userEvent.setup();
    render(<TelemetryTable records={adaptTelemetryRecords(telemetryRamsDummy.slice(0, 1))} />);
    expect(screen.queryByRole("columnheader", { name: "Record ID" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Atur kolom" }));
    await user.click(screen.getByRole("checkbox", { name: "Record ID" }));
    expect(screen.getByRole("columnheader", { name: "Record ID" })).toBeInTheDocument();
  });
});

