import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkOrderWorkspace } from "../WorkOrderWorkspace";
import { workOrderDummy } from "@/dummy/workOrderDummy";

// WorkOrderTable uses DotsThreeVertical from phosphor-icons
vi.mock("@phosphor-icons/react/dist/ssr", () => ({
  DotsThreeVertical: (props: any) => <span data-testid="dots-icon" {...props} />,
}));

describe("WorkOrderWorkspace", () => {
  it("renders the page header 'SPK Maintenance'", () => {
    render(<WorkOrderWorkspace workOrders={workOrderDummy} />);

    expect(screen.getByRole("heading", { name: /spk maintenance/i })).toBeInTheDocument();
  });

  it("renders summary cards section", () => {
    render(<WorkOrderWorkspace workOrders={workOrderDummy} />);

    expect(screen.getByText("SPK Terbuka")).toBeInTheDocument();
    expect(screen.getByText("Sedang Dikerjakan")).toBeInTheDocument();
    expect(screen.getAllByText("Selesai")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Overdue")[0]).toBeInTheDocument();
  });

  it("renders SPK table with rows", () => {
    render(<WorkOrderWorkspace workOrders={workOrderDummy} />);

    // The workspace builds 4 total rows: SPK-001 (from workOrderDummy), SPK-2407-002, SPK-2406-089, SPK-2407-004
    expect(screen.getByText("Daftar Surat Perintah Kerja (SPK)")).toBeInTheDocument();
    expect(screen.getByText("SPK-2407-002")).toBeInTheDocument();
    expect(screen.getByText("SPK-2406-089")).toBeInTheDocument();
    expect(screen.getByText("SPK-2407-004")).toBeInTheDocument();
  });

  it("clicking a row updates the detail panel", async () => {
    const user = userEvent.setup();
    render(<WorkOrderWorkspace workOrders={workOrderDummy} />);

    // Click the SPK-2407-002 row
    const row = screen.getByText("SPK-2407-002").closest("tr")!;
    await user.click(row);

    // Detail panel eyebrow should update to show SPK-2407-002
    const detailPanel = screen.getByText("Detail SPK Terpilih").closest("[class*='card']")!;
    expect(within(detailPanel).getByText("SPK-2407-002")).toBeInTheDocument();
  });

  it("detail panel shows source, asset, priority info", () => {
    render(<WorkOrderWorkspace workOrders={workOrderDummy} />);

    // Default selected is the first row (SPK-001 mapped from WO-001)
    expect(screen.getAllByText("Sumber Indikasi")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Armada & Gerbong")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Prioritas Operasional")[0]).toBeInTheDocument();
    // The first row has source "Alarm: Deviasi BC" and event code LOCAL_BC_DEVIATION
    expect(screen.getAllByText("Alarm: Deviasi BC")[0]).toBeInTheDocument();
    expect(screen.getAllByText("LOCAL_BC_DEVIATION")[0]).toBeInTheDocument();
  });

  it("'Mulai Dikerjakan' button changes status for open SPK", async () => {
    const user = userEvent.setup();
    render(<WorkOrderWorkspace workOrders={workOrderDummy} />);

    // The first SPK (from workOrderDummy Draft) maps to "open" status
    // The detail panel should show the "Mulai Dikerjakan" button
    const startButtons = screen.getAllByRole("button", { name: /mulai dikerjakan/i });
    await user.click(startButtons[0]);

    // After clicking, status should change to in-progress, which shows "Tandai Selesai"
    expect(screen.getAllByRole("button", { name: /tandai selesai/i })[0]).toBeInTheDocument();
  });

  it("timeline steps are rendered", () => {
    render(<WorkOrderWorkspace workOrders={workOrderDummy} />);

    // Default selected is the first row with "open" status
    // getTimeline("open") returns ["Created", "Waiting Assignment"]
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Waiting Assignment")).toBeInTheDocument();
  });
});
