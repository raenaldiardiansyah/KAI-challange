import { test, expect } from "@playwright/test";

test.describe("Alarm Center Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/alarm-center");
  });

  test("halaman alarm tampil tanpa error", async ({ page }) => {
    await expect(page.locator("body")).not.toContainText("404");
  });

  test("alarm table tampil dengan data", async ({ page }) => {
    const body = await page.textContent("body");
    expect(body).toContain("Daftar Alarm");
  });

  test("alarm table memiliki baris data", async ({ page }) => {
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("pagination bekerja - lihat lebih banyak", async ({ page }) => {
    const initialRows = await page.locator("tbody tr").count();
    
    const loadMoreButton = page.getByRole("button", { name: /lebih banyak/i });
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      const afterRows = await page.locator("tbody tr").count();
      expect(afterRows).toBeGreaterThan(initialRows);
    }
  });

  test("tombol aksi alarm ada (Evidence, Buat SPK)", async ({ page }) => {
    const body = await page.textContent("body");
    expect(body).toContain("Evidence");
    expect(body).toContain("Buat SPK");
  });
});
