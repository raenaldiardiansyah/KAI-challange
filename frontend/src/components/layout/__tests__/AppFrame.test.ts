import { describe, expect, it } from "vitest";
import { isAuthPath } from "../AppFrame";

describe("AppFrame auth routes", () => {
  it.each(["/login", "/register"])(
    "tidak memasukkan %s ke dalam layout dashboard",
    (pathname) => {
      expect(isAuthPath(pathname)).toBe(true);
    },
  );

  it("tetap memakai layout dashboard untuk halaman aplikasi", () => {
    expect(isAuthPath("/overview")).toBe(false);
  });
});
