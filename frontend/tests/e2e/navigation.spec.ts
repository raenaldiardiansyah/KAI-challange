import { test, expect } from "@playwright/test";

const sidebarRoutes = [
  { label: "Ringkasan", href: "/overview" },
  { label: "Armada", href: "/trainset" },
  { label: "Gerbong", href: "/car-detail" },
  { label: "Insight", href: "/insight-analytic" },
  { label: "Prediktif", href: "/predictive-maintenance" },
  { label: "Pantauan", href: "/live-monitoring" },
  { label: "Alarm", href: "/alarm-center" },
  { label: "SPK", href: "/work-order" },
  { label: "Laporan", href: "/report-analytics" },
  { label: "Pengaturan", href: "/settings" },
];

test.describe("Global Navigation", () => {
  test("semua 10 route sidebar bisa diakses tanpa 404", async ({ page }) => {
    test.setTimeout(120000); // Allow more time for initial Next.js compilation of 10 pages
    for (const route of sidebarRoutes) {
      await page.goto(route.href, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).not.toContainText("404");
      await expect(page.locator("body")).not.toContainText("This page could not be found");
    }
  });

  test("/telemetry-explorer bisa diakses langsung (hidden route)", async ({ page }) => {
    await page.goto("/telemetry-explorer");
    await expect(page.locator("body")).not.toContainText("404");
  });

  test("sidebar link aktif sesuai halaman", async ({ page }) => {
    await page.goto("/overview");
    const activeLink = page.locator('.sidebar-link.active');
    await expect(activeLink).toHaveCount(1);
    await expect(activeLink).toHaveAttribute("href", "/overview");
  });

  test("klik sidebar navigasi ke halaman yang benar", async ({ page }) => {
    await page.goto("/overview");

    // Klik menu Alarm
    await page.locator(`a.sidebar-link[href="/alarm-center"]`).click();
    await page.waitForURL("**/alarm-center");
    await expect(page).toHaveURL(/alarm-center/);
  });
});
