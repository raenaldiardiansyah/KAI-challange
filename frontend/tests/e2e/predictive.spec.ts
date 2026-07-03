import { test, expect } from "@playwright/test";

test.describe("Predictive Maintenance Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/predictive-maintenance");
  });

  test("halaman prediktif tampil tanpa error", async ({ page }) => {
    await expect(page.locator("body")).not.toContainText("404");
    await expect(page.locator("body")).not.toContainText("Application error");
  });

  test("risk summary cards tampil", async ({ page }) => {
    const body = await page.textContent("body");
    // Should show risk-related content
    expect(body).toContain("Risiko");
  });

  test("maintenance queue tampil", async ({ page }) => {
    const body = await page.textContent("body");
    expect(body).toContain("Antrean Pemeliharaan");
  });

  test("daftar risiko memiliki data rows", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("link Buat SPK mengarah ke /work-order", async ({ page }) => {
    const spkLinks = page.locator('a[href="/work-order"]');
    const count = await spkLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("link Lihat Evidence mengarah ke /car-detail", async ({ page }) => {
    const evidenceLinks = page.locator('a[href="/car-detail"]');
    const count = await evidenceLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
