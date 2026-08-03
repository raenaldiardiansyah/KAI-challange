import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("auth form layout styles", () => {
  it("keeps long validation messages readable and the page scrollable", () => {
    const cssPath = path.resolve(__dirname, "../LoginForm.module.css");
    const css = readFileSync(cssPath, "utf8");

    expect(css).toMatch(/\.page\s*{[\s\S]*?display:\s*flex;/);
    expect(css).toMatch(/\.page\s*{[\s\S]*?flex-direction:\s*row;/);
    expect(css).toMatch(/\.page\s*{[\s\S]*?overflow-y:\s*auto;/);
    expect(css).toMatch(/\.panel\s*{[\s\S]*?margin-block:\s*auto;/);
    expect(css).toMatch(/\.error\s*{[\s\S]*?line-height:\s*1\.45;/);
    expect(css).toMatch(/\.error\s*{[\s\S]*?overflow-wrap:\s*anywhere;/);
    expect(css).toMatch(
      /@media \(max-height:\s*820px\)[\s\S]*?\.panel\s*{[\s\S]*?margin-block:\s*0;/,
    );
  });
});
