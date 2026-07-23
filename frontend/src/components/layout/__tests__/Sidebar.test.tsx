import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "../Sidebar";
import { routes } from "@/constants/routes";

// Mock the icons
vi.mock("@phosphor-icons/react/dist/ssr", () => {
  const createIcon = (name: string) => {
    const MockIcon = (props: any) => <span data-testid={`icon-${name}`} {...props} />;
    MockIcon.displayName = `Mock${name}Icon`;
    return MockIcon;
  };
  return {
    ChartDonut: createIcon("ChartDonut"),
    Train: createIcon("Train"),
    TrainRegional: createIcon("TrainRegional"),
    Lightbulb: createIcon("Lightbulb"),
    Wrench: createIcon("Wrench"),
    Broadcast: createIcon("Broadcast"),
    Warning: createIcon("Warning"),
    ClipboardText: createIcon("ClipboardText"),
    FileText: createIcon("FileText"),
    Pulse: createIcon("Pulse"),
    GearSix: createIcon("GearSix"),
    CaretLeft: createIcon("CaretLeft"),
    CaretRight: createIcon("CaretRight"),
  };
});

describe("Sidebar", () => {
  // Setup localStorage mock
  beforeEach(() => {
    const localStorageMock = { 
      getItem: vi.fn(), 
      setItem: vi.fn(), 
      removeItem: vi.fn(), 
      clear: vi.fn() 
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock, writable: true });
  });

  it("renders all 11 sidebar menu links", () => {
    render(<Sidebar />);
    
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(11);
  });

  it("each link has the correct href from routes constant", () => {
    render(<Sidebar />);
    
    const links = screen.getAllByRole("link");
    routes.forEach((route, index) => {
      expect(links[index]).toHaveAttribute("href", route.href);
    });
  });

  it("labels are correct in collapsed mode and preserve full label title", () => {
    render(<Sidebar />);
    
    routes.forEach((route) => {
      const visibleLabel = route.shortLabel ?? route.label;
      const link = screen.getByRole("link", { name: new RegExp(visibleLabel, "i") });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("title", route.label);
    });
  });

  it("the link matching current pathname has 'active' class", () => {
    render(<Sidebar />);
    
    // In setup.ts, usePathname is mocked to return '/overview'
    // First route in routes constant is '/overview'
    const overviewLink = screen.getByRole("link", { name: /ringkas/i });
    expect(overviewLink).toHaveClass("active");
    
    // Other links should not be active
    const armadaLink = screen.getByRole("link", { name: /armada/i });
    expect(armadaLink).not.toHaveClass("active");
  });
});
