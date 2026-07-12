import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("Modal CSS", () => {
  it("keeps modal content above the backdrop", () => {
    const cssPath = path.resolve(__dirname, "../../../app/globals.css");
    const css = readFileSync(cssPath, "utf8");
    const modalBlock = css.match(/\.modal\s*\{[^}]+\}/)?.[0] ?? "";
    const backdropBlock = css.match(/\.modal-backdrop\s*\{[^}]+\}/)?.[0] ?? "";

    expect(backdropBlock).toContain("z-index: 10");
    expect(modalBlock).toContain("position: fixed");
    expect(modalBlock).toContain("z-index: 11");
  });
});
