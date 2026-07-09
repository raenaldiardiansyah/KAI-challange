import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MaintenanceTable } from "../MaintenanceTable";
import { maintenanceDummy } from "@/dummy/maintenanceDummy";

describe("MaintenanceTable", () => {
  const onSelectRisk = vi.fn();

  function renderTable(selectedId?: string) {
    return render(
      <MaintenanceTable
        risks={maintenanceDummy}
        selectedId={selectedId}
        onSelectRisk={onSelectRisk}
      />
    );
  }

  it("renders the card title 'Antrean Pemeliharaan'", () => {
    renderTable();

    expect(screen.getByText(/antrean pemeliharaan/i)).toBeInTheDocument();
  });

  it("renders table with risk data rows", () => {
    renderTable();

    const tbody = screen.getAllByRole("rowgroup")[1];
    const rows = within(tbody).getAllByRole("row");
    expect(rows).toHaveLength(maintenanceDummy.length);
  });

  it("shows asset info (TS-001, Gerbong 5)", () => {
    renderTable();

    expect(screen.getByText(/TS-001 Gerbong 5/)).toBeInTheDocument();
    expect(screen.getByText(/TS-002 Gerbong 2/)).toBeInTheDocument();
  });

  it("shows severity badge", () => {
    renderTable();

    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("'Lihat Detail' button calls onSelectRisk", async () => {
    const user = userEvent.setup();
    renderTable();

    const detailButtons = screen.getAllByRole("button", { name: /lihat detail/i });
    await user.click(detailButtons[0]);

    expect(onSelectRisk).toHaveBeenCalledWith("PM-001");
  });

  it("'Lihat Evidence' link has href /car-detail", () => {
    renderTable();

    const evidenceLinks = screen.getAllByRole("link", { name: /lihat evidence/i });
    expect(evidenceLinks[0]).toHaveAttribute("href", "/car-detail");
  });

  it("'Buat SPK' link has href /work-order", () => {
    renderTable();

    const spkLinks = screen.getAllByRole("link", { name: /buat spk/i });
    expect(spkLinks[0]).toHaveAttribute("href", "/work-order");
  });

  it("selected row has 'selected' class", () => {
    renderTable("PM-001");

    const tbody = screen.getAllByRole("rowgroup")[1];
    const rows = within(tbody).getAllByRole("row");
    expect(rows[0]).toHaveClass("selected");
    expect(rows[1]).not.toHaveClass("selected");
  });
});
