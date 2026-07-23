import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPanel } from "../SettingsPanel";
import { DataModeProvider } from "@/features/data-mode/DataModeProvider";

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: { role: "ADMIN" } })
}));

function renderSettings() {
  return render(
    <DataModeProvider>
      <SettingsPanel />
    </DataModeProvider>
  );
}

describe("SettingsPanel", () => {
  it("renders the card title", () => {
    renderSettings();
    expect(screen.getByRole("heading", { name: /pengaturan sistem/i })).toBeInTheDocument();
  });

  it("shows UI preferences section", () => {
    renderSettings();
    expect(screen.getAllByText("Mode Tampilan")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Tingkat Detail Map")[0]).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "50%" })).toBeInTheDocument();
  });

  it("shows data source select with dummy mode option", async () => {
    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "Data & Koneksi" }));
    expect(screen.getAllByText("Sumber Data")[0]).toBeInTheDocument();
    // Verify Dummy option exists
    expect(screen.getByRole("option", { name: /dummy \/ mock/i })).toBeInTheDocument();
  });

  it("shows that dummy mode does not call RAMS", async () => {
    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "Data & Koneksi" }));
    expect(screen.getByText(/dummy aktif.*tidak menghubungi rams/i)).toBeInTheDocument();
  });

  it("shows email notification input", async () => {
    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "Data & Koneksi" }));
    expect(screen.getByText(/email notifikasi alarm kritis/i)).toBeInTheDocument();
    const emailInput = screen.getByDisplayValue("admin.depo@kai.id");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("allows an admin to change an existing user role separately from password", async () => {
    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "Pengguna" }));
    const editRole = await screen.findByRole("button", { name: "Edit role teknisi" });
    const userRow = editRole.closest("tr");
    expect(userRow).not.toBeNull();
    expect(within(userRow!).getByText("TECHNICIAN")).toBeInTheDocument();

    await userEvent.click(editRole);
    const dialog = screen.getByRole("dialog", { name: "Edit Role Pengguna" });
    expect(within(dialog).getByDisplayValue("teknisi")).toHaveAttribute("readonly");
    expect(within(dialog).getByText(/tidak mengubah password/i)).toBeInTheDocument();
    await userEvent.selectOptions(within(dialog).getByLabelText("Role pengguna"), "ADMIN");
    await userEvent.click(within(dialog).getByRole("button", { name: "Simpan Role" }));

    await waitFor(() => expect(within(userRow!).getByText("ADMIN")).toBeInTheDocument());
  });
});
