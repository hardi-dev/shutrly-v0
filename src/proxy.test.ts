import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { isPublicPath, proxy } from "./proxy";

describe("proxy (early redirect only)", () => {
  it("AC-AUTH-011 treats the auth screens and Better Auth's endpoints as public", () => {
    const paths = ["/login", "/verify/confirm", "/auth/continue", "/api/auth/callback/google"];
    for (const path of paths) expect(isPublicPath(path)).toBe(true);
    expect(isPublicPath("/profile")).toBe(false);
  });

  it("AC-ACC-007 lets client gallery links through without an Owner session", () => {
    expect(isPublicPath("/g/abc")).toBe(true);
    expect(isPublicPath("/g/abc/foto")).toBe(true);
    expect(isPublicPath("/gallery")).toBe(false);
  });

  it("AC-AUTH-014 redirects an owner page without a session cookie to /login", () => {
    const response = proxy(new NextRequest("http://localhost:3000/profile"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("AC-AUTH-014 lets a request with a session cookie through; the guard still decides", () => {
    const headers = { cookie: "better-auth.session_token=abc" };
    const response = proxy(new NextRequest("http://localhost:3000/profile", { headers }));
    expect(response.headers.get("location")).toBeNull();
  });
});
