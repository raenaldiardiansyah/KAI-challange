import { test, expect } from "@playwright/test";

test.describe("Work Order (SPK) Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work-order");
  });

  test("halaman SPK tampil dengan header", async ({ page }) => {
    const body = await page.textContent("body");
    expect(body).toContain("SPK Maintenance");
  });

  test("summary cards SPK tampil", async ({ page }) => {
    const body = await page.textContent("body");
    // Check that summary sections exist
    expect(body).toContain("Terbuka");
    expect(body).toContain("Selesai");
  });

  test("daftar SPK tabel tampil", async ({ page }) => {
    const body = await page.textContent("body");
    expect(body).toContain("Daftar Surat Perintah Kerja");
  });

  test("klik row SPK membuka detail", async ({ page }) => {
    // Click on a table row
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Click the second row to change selection
    if (rowCount > 1) {
      await rows.nth(1).click();
      // Detail panel should update
      const detailPanel = page.locator(".spk-detail-panel");
      await expect(detailPanel).toBeVisible();
    }
  });

  test("detail SPK menampilkan informasi", async ({ page }) => {
    const body = await page.textContent("body");
    expect(body).toContain("Detail SPK Terpilih");
    expect(body).toContain("Sumber Indikasi");
    expect(body).toContain("Armada & Gerbong");
    expect(body).toContain("Prioritas Operasional");
  });

  test("timeline progress tampil", async ({ page }) => {
    const timeline = page.locator(".spk-timeline");
    await expect(timeline).toBeVisible();
  });
});
