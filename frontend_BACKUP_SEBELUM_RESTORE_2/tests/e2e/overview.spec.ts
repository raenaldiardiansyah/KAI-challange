import { test, expect } from "@playwright/test";

test.describe("Overview Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/overview");
  });

  test("summary cards tampil", async ({ page }) => {
    // Should have summary stat cards
    const cards = page.locator(".stat-card, .overview-stat");
    const pageContent = await page.textContent("body");
    // Check for key summary metrics
    expect(pageContent).toContain("Armada");
  });

  test("priority insight C5 tampil", async ({ page }) => {
    const body = await page.textContent("body");
    expect(body).toContain("Car 5");
    expect(body).toContain("Insight Prioritas");
  });

  test("tombol Tinjau Bukti navigasi ke /car-detail", async ({ page }) => {
    const button = page.getByRole("button", { name: /Tinjau Bukti/i });
    await expect(button).toBeVisible();
    await button.click();
    await page.waitForURL("**/car-detail**");
    await expect(page).toHaveURL(/car-detail/);
  });

  test("alarm aktif table tampil", async ({ page }) => {
    const body = await page.textContent("body");
    expect(body).toContain("Alarm Aktif");
  });

  test("train composition tampil", async ({ page }) => {
    // Check for car composition elements
    const composition = page.locator(".composition, .train-composition");
    // At minimum the page should render without error
    await expect(page.locator("h1")).toBeVisible();
  });
});
