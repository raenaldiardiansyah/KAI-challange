import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataModeProvider } from "@/features/data-mode/DataModeProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { UserSessionControl } from "../UserSessionControl";

vi.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: vi.fn() }));

function renderControl() {
  return render(
    <DataModeProvider>
      <UserSessionControl />
    </DataModeProvider>
  );
}

describe("UserSessionControl data mode switch", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ALLOW_LIVE_API", "true");
    window.localStorage.clear();
    vi.mocked(useCurrentUser).mockReturnValue({
      user: null,
      isLoading: false,
      refreshUser: vi.fn(async () => undefined),
      logout: vi.fn(async () => undefined)
    });
  });

  it("switches all runtime data from Dummy to API and back", async () => {
    const user = userEvent.setup();
    renderControl();

    const dummyButton = screen.getByRole("button", { name: /sumber data dummy/i });
    await waitFor(() => expect(dummyButton).toBeEnabled());
    await user.click(dummyButton);

    const apiButton = await screen.findByRole("button", { name: /sumber data api/i });
    expect(apiButton).toHaveTextContent("Mode API");
    expect(apiButton).toHaveAttribute("aria-pressed", "true");

    await user.click(apiButton);
    expect(await screen.findByRole("button", { name: /sumber data dummy/i })).toHaveTextContent("Mode Dummy");
  });

  it("keeps the mode switch visible beside an authenticated user", async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      user: { id: 1, username: "admin", email: null, name: "Administrator", role: "ADMIN", isActive: true },
      isLoading: false,
      refreshUser: vi.fn(async () => undefined),
      logout: vi.fn(async () => undefined)
    });

    renderControl();
    expect(screen.getByRole("button", { name: /sumber data dummy/i })).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });
});
