import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPanel } from "../SettingsPanel";
import { DataModeProvider } from "@/features/data-mode/DataModeProvider";
import { authUsersFixture } from "@/dummy/rams";

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
  afterEach(() => vi.unstubAllGlobals());

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

  it("shows device sessions and admin audit activity in the security tab", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/auth/sessions")) {
        return Response.json([{
          id: "2fdd5f9d-b395-4df2-957e-b55862826d2f",
          device_name: "Chrome di Windows",
          ip_address: "127.0.0.1",
          user_agent: "Chrome",
          created_at: "2026-08-03T00:00:00Z",
          last_used_at: "2026-08-03T00:10:00Z",
          expires_at: "2026-08-10T00:00:00Z",
        }]);
      }
      if (url.includes("/auth/audit-logs")) {
        return Response.json([{
          id: 1,
          actor_user_id: 1,
          target_user_id: 2,
          action: "admin.user_created",
          ip_address: "127.0.0.1",
          user_agent: "Chrome",
          details: { role: "ADMIN" },
          created_at: "2026-08-03T00:00:00Z",
        }]);
      }
      return Response.json([]);
    }));

    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "Keamanan" }));

    expect(await screen.findByText("Chrome di Windows")).toBeInTheDocument();
    expect(screen.getByText("Audit Aktivitas Admin")).toBeInTheDocument();
    expect(await screen.findByText("admin.user_created")).toBeInTheDocument();
  });

  it("labels user creation as an admin-only area", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(authUsersFixture)));
    renderSettings();
    await userEvent.click(screen.getByRole("tab", { name: "Pengguna" }));
    expect(await screen.findByText("Area khusus Admin")).toBeInTheDocument();
    expect(screen.getByText(/hanya admin yang dapat membuat akun admin/i)).toBeInTheDocument();
  });

  it("allows an admin to change an existing user role separately from password", async () => {
    vi.stubGlobal("fetch", vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if ((init?.method ?? "GET") === "GET") {
        return new Response(JSON.stringify(authUsersFixture), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      const userId = Number(String(_input).split("/").at(-1));
      const input = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : {};
      const user = authUsersFixture.find((item) => item.id === userId);
      return new Response(JSON.stringify({ ...user, ...input }), { status: 200, headers: { "Content-Type": "application/json" } });
    }));
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
