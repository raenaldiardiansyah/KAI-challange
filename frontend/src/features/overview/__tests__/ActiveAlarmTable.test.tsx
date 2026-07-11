import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActiveAlarmTable } from "../ActiveAlarmTable";
import { alarmDummy } from "@/dummy/alarmDummy";

describe("ActiveAlarmTable", () => {
  it("renders a compact alarm chart instead of a full table", () => {
    render(<ActiveAlarmTable alarms={alarmDummy} />);

    expect(screen.getByRole("heading", { name: /grafik alarm/i })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Total Alarm")).toBeInTheDocument();
    expect(screen.getByText("Prioritas Tinggi")).toBeInTheDocument();
  });

  it("shows severity distribution rows", () => {
    render(<ActiveAlarmTable alarms={alarmDummy} />);

    expect(screen.getByText("Tinggi")).toBeInTheDocument();
    expect(screen.getByText("Sedang")).toBeInTheDocument();
    expect(screen.getByText("Rendah")).toBeInTheDocument();
  });

  it("shows all alarm status cards in one summary", () => {
    render(<ActiveAlarmTable alarms={alarmDummy} />);

    expect(screen.getAllByText("Terbuka").length).toBeGreaterThan(0);
    expect(screen.getByText("Diakui")).toBeInTheDocument();
    expect(screen.getByText("Ditutup")).toBeInTheDocument();
    expect(screen.getByText("Selesai Otomatis")).toBeInTheDocument();
  });

  it("links to alarm center for full alarm list", () => {
    render(<ActiveAlarmTable alarms={alarmDummy} />);

    expect(screen.getByRole("link", { name: /lihat semua alarm/i })).toHaveAttribute("href", "/alarm-center");
  });
});
