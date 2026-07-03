import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActiveAlarmTable } from "../ActiveAlarmTable";
import { alarmDummy } from "@/dummy/alarmDummy";

describe("ActiveAlarmTable", () => {
  it("renders alarm table with data rows", () => {
    render(<ActiveAlarmTable alarms={alarmDummy} />);
    
    // thead is first rowgroup, tbody is second
    const tbody = screen.getAllByRole("rowgroup")[1];
    const rows = within(tbody).getAllByRole("row");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("shows severity badges", () => {
    render(<ActiveAlarmTable alarms={alarmDummy} />);
    
    // Just verify the badges for the first few alarms appear
    expect(screen.getAllByText("Tinggi").length).toBeGreaterThan(0);
  });

  it("toggle between 5 and 10 items works", async () => {
    const user = userEvent.setup();
    render(<ActiveAlarmTable alarms={alarmDummy} />);
    
    let tbody = screen.getAllByRole("rowgroup")[1];
    let rows = within(tbody).getAllByRole("row");
    expect(rows).toHaveLength(5);
    
    const toggleButton = screen.getByRole("button", { name: /lebih banyak/i });
    await user.click(toggleButton);
    
    tbody = screen.getAllByRole("rowgroup")[1];
    rows = within(tbody).getAllByRole("row");
    expect(rows).toHaveLength(10);
  });

  it("pagination prev/next works", async () => {
    const user = userEvent.setup();
    render(<ActiveAlarmTable alarms={alarmDummy} />);
    
    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);
    
    expect(screen.getByText("2 / 6")).toBeInTheDocument();
    
    const prevButton = screen.getByRole("button", { name: /prev/i });
    await user.click(prevButton);
    
    expect(screen.getByText("1 / 6")).toBeInTheDocument();
  });
});
