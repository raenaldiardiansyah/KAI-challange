import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../LoginForm";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LoginForm", () => {
  it("validates required credentials", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Masuk" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Username dan password wajib diisi");
  });

  it("sends credentials only to the local BFF and redirects after success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true })
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "admin123");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", expect.objectContaining({ method: "POST" }));
    expect((globalThis as Record<string, unknown>).__mockRouterPush).toBeDefined();
  });

  it("shows the backend error detail", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: "Invalid username or password" })
    }));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid username or password");
  });
});
