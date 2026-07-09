import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";

// ── Mock next/navigation ────────────────────────────────────────────
const pushMock = vi.fn();
const replaceMock = vi.fn();
const backMock = vi.fn();
const prefetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    back: backMock,
    prefetch: prefetchMock,
    pathname: "/",
    query: {},
  }),
  usePathname: () => "/overview",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Expose pushMock for individual tests to assert on
(globalThis as Record<string, unknown>).__mockRouterPush = pushMock;

// ── Mock next/image ─────────────────────────────────────────────────
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { alt = "", fill, priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={String(alt)} {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

// ── Mock next/link ──────────────────────────────────────────────────
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}));

// ── Mock window.alert ───────────────────────────────────────────────
globalThis.alert = vi.fn();

// ── Reset mocks between tests ───────────────────────────────────────
afterEach(() => {
  vi.clearAllMocks();
});
