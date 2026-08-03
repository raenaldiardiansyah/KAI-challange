import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "../RegisterForm";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RegisterForm", () => {
it("shows the safely assigned registration role", () => {
render(<RegisterForm />);
expect(screen.getByText(/Role pendaftaran otomatis:/)).toHaveTextContent(
  "Role pendaftaran otomatis: Technician. Admin dapat mengubahnya setelah akun disetujui.",
);
expect(screen.queryByRole("combobox", { name: /role/i })).not.toBeInTheDocument();
});

it("validates required fields", async () => {
    render(<RegisterForm />);
    await userEvent.click(screen.getByRole("button", { name: "Daftar akun" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Semua kolom wajib diisi");
  });

  it("rejects a mismatched password confirmation", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText("Nama lengkap"), "Budi Teknisi");
    await userEvent.type(screen.getByLabelText("Username"), "budi.teknisi");
    await userEvent.type(screen.getByLabelText("Password"), "password-kuat-123");
    await userEvent.type(screen.getByLabelText("Konfirmasi password"), "password-kuat-456");
    await userEvent.click(screen.getByRole("button", { name: "Daftar akun" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Konfirmasi password belum sama");
  });

  it("submits to the local registration BFF and shows pending approval", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        username: "budi.teknisi",
        account_status: "PENDING"
      })
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText("Nama lengkap"), "Budi Teknisi");
    await userEvent.type(screen.getByLabelText("Username"), "Budi.Teknisi");
    await userEvent.type(screen.getByLabelText("Password"), "password-kuat-123");
    await userEvent.type(screen.getByLabelText("Konfirmasi password"), "password-kuat-123");
    await userEvent.click(screen.getByRole("button", { name: "Daftar akun" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({ method: "POST" })
    );
    expect(await screen.findByRole("status")).toHaveTextContent("menunggu persetujuan administrator");
  });

  it("explains when the deployed backend does not have registration yet", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ detail: "Not Found" })
    }));
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText("Nama lengkap"), "Budi Teknisi");
    await userEvent.type(screen.getByLabelText("Username"), "budi.teknisi");
    await userEvent.type(screen.getByLabelText("Password"), "password-kuat-123");
    await userEvent.type(screen.getByLabelText("Konfirmasi password"), "password-kuat-123");
    await userEvent.click(screen.getByRole("button", { name: "Daftar akun" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("backend terbaru");
    expect(screen.queryByText("Not Found")).not.toBeInTheDocument();
  });
});
