import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MaintenanceTable } from "../MaintenanceTable";
import { maintenanceDummy } from "@/dummy/maintenanceDummy";
import { buildRiskView } from "../riskViewModel";

describe("MaintenanceTable", () => {
  const onSelectRisk = vi.fn();
  const onOpenDetail = vi.fn();
  const onOpenEvidence = vi.fn();
  const risks = maintenanceDummy.map(buildRiskView);

  function renderTable(selectedId?: string) {
    return render(
      <MaintenanceTable
        risks={risks}
        selectedId={selectedId}
        onSelectRisk={onSelectRisk}
        onOpenDetail={onOpenDetail}
        onOpenEvidence={onOpenEvidence}
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
    expect(rows).toHaveLength(risks.length);
  });

  it("shows asset info (TS-001, Gerbong 5)", () => {
    renderTable();

    expect(screen.getByText("TS-001")).toBeInTheDocument();
    expect(screen.getByText("Gerbong 5")).toBeInTheDocument();
    expect(screen.getByText("TS-002")).toBeInTheDocument();
    expect(screen.getByText("Gerbong 2")).toBeInTheDocument();
  });

  it("shows severity badge", () => {
    renderTable();

    expect(screen.getByText("84%")).toBeInTheDocument();
    expect(screen.getByText("61%")).toBeInTheDocument();
  });

  it("'Detail' button opens detail panel", async () => {
    const user = userEvent.setup();
    renderTable();

    const detailButtons = screen.getAllByRole("button", { name: /^detail$/i });
    await user.click(detailButtons[0]);

    expect(onOpenDetail).toHaveBeenCalledWith("PM-001");
  });

  it("'Lihat evidence' menu action opens evidence dialog", async () => {
    const user = userEvent.setup();
    renderTable();

    const menuButtons = screen.getAllByRole("button", { name: /tindakan lainnya/i });
    await user.click(menuButtons[0]);
    await user.click(screen.getByRole("button", { name: /lihat evidence/i }));

    expect(onOpenEvidence).toHaveBeenCalledWith("PM-001");
  });

  it("'Buat SPK' link keeps work-order route", () => {
    renderTable();

    const spkLinks = screen.getAllByRole("link", { name: /buat spk/i });
    expect(spkLinks[0]).toHaveAttribute("href", expect.stringContaining("/work-order"));
  });

  it("selected row has 'selected' class", () => {
    renderTable("PM-001");

    const tbody = screen.getAllByRole("rowgroup")[1];
    const rows = within(tbody).getAllByRole("row");
    expect(rows[0]).toHaveClass("selected");
    expect(rows[1]).not.toHaveClass("selected");
  });
});
