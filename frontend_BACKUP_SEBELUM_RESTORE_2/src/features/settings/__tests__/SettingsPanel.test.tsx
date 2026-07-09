import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsPanel } from "../SettingsPanel";

describe("SettingsPanel", () => {
  it("renders the card title", () => {
    render(<SettingsPanel />);
    expect(screen.getByRole("heading", { name: /pengaturan sistem/i })).toBeInTheDocument();
  });

  it("shows UI preferences section", () => {
    render(<SettingsPanel />);
    expect(screen.getByText("Preferensi Antarmuka (UI)")).toBeInTheDocument();
    expect(screen.getAllByText("Mode Tampilan")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Tingkat Detail Map")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Refresh Interval (Auto-sync)")[0]).toBeInTheDocument();
  });

  it("shows data source select with dummy mode option", () => {
    render(<SettingsPanel />);
    expect(screen.getByText("Koneksi Backend & Notifikasi")).toBeInTheDocument();
    
    expect(screen.getAllByText("Sumber Data (Data Source)")[0]).toBeInTheDocument();
    // Verify Dummy option exists
    expect(screen.getByRole("option", { name: /dummy \/ mock mode/i })).toBeInTheDocument();
  });

  it("shows connection status text 'Simulasi Connected WebSocket'", () => {
    render(<SettingsPanel />);
    expect(screen.getByText(/simulasi connected websocket/i)).toBeInTheDocument();
  });

  it("shows email notification input", () => {
    render(<SettingsPanel />);
    expect(screen.getByText(/email notifikasi alarm kritis/i)).toBeInTheDocument();
    const emailInput = screen.getByDisplayValue("admin.depo@kai.id");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });
});
