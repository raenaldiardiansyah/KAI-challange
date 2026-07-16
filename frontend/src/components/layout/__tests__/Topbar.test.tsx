import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataModeProvider } from "@/features/data-mode/DataModeProvider";
import { Topbar } from "../Topbar";

vi.mock("@/features/auth/UserSessionControl", () => ({
  UserSessionControl: () => null
}));

vi.mock("@/services/systemService", () => ({
  getSystemStatus: vi.fn()
}));

describe("Topbar data mode toggle", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ALLOW_LIVE_API", "true");
    window.localStorage.clear();
  });

  it("makes the visible DUMMY indicator switch to API mode", async () => {
    const user = userEvent.setup();
    render(
      <DataModeProvider>
        <Topbar />
      </DataModeProvider>
    );

    const dummyButton = screen.getByRole("button", { name: /Sumber data Dummy/i });
    await waitFor(() => expect(dummyButton).toBeEnabled());
    expect(dummyButton).toHaveTextContent("DUMMY");

    await user.click(dummyButton);

    const apiButton = await screen.findByRole("button", { name: /Sumber data API/i });
    expect(apiButton).toHaveTextContent("LIVE");
    expect(apiButton).toHaveAttribute("aria-pressed", "true");
  });
});
