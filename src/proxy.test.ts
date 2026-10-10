import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/composition/app-stage/app-stage", () => ({ isLandingOnly: vi.fn() }));

import { isLandingOnly } from "@/composition/app-stage/app-stage";

import { isLandingPath, isPublicPath, proxy } from "./proxy";

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost:3000${path}`, { headers });
}

const rewrittenTo = (response: Response) => response.headers.get("x-middleware-rewrite");

beforeEach(() => vi.mocked(isLandingOnly).mockResolvedValue(false));

describe("proxy (production gate, then early redirect)", () => {
  it("AC-AUTH-011 treats the auth screens and Better Auth's endpoints as public", () => {
    const paths = ["/login", "/verify/confirm", "/auth/continue", "/api/auth/callback/google"];
    for (const path of paths) expect(isPublicPath(path)).toBe(true);
    expect(isPublicPath("/profile")).toBe(false);
  });

  it("AC-ACC-007 lets client gallery links through without an Owner session", () => {
    expect(isPublicPath("/g/abc")).toBe(true);
    expect(isPublicPath("/g/abc/photos")).toBe(true);
    expect(isPublicPath("/gallery")).toBe(false);
  });

  it("AC-LND-001 AC-LND-005 keeps the landing page and its waitlist endpoint public", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/api/waitlist")).toBe(true);
  });

  it("AC-AUTH-014 redirects an owner page without a session cookie to /login", async () => {
    const response = await proxy(request("/profile"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("AC-AUTH-014 lets a request with a session cookie through; the guard still decides", async () => {
    const response = await proxy(request("/profile", { cookie: "better-auth.session_token=abc" }));
    expect(response.headers.get("location")).toBeNull();
  });

  it("AC-LND-013 answers every non-landing path with not found on production, signed in or not", async () => {
    vi.mocked(isLandingOnly).mockResolvedValue(true);
    const cookie = { cookie: "better-auth.session_token=abc" };
    for (const path of ["/login", "/register", "/w/123", "/onboarding/workspace", "/api/health"]) {
      const response = await proxy(request(path, cookie));
      expect(rewrittenTo(response)).toBe("http://localhost:3000/_gated");
      expect(response.headers.get("location")).toBeNull();
    }
  });

  it("AC-LND-013 still serves the landing page, the waitlist and the metadata files", async () => {
    vi.mocked(isLandingOnly).mockResolvedValue(true);
    for (const path of ["/", "/api/waitlist", "/robots.txt"]) {
      expect(isLandingPath(path)).toBe(true);
      expect(rewrittenTo(await proxy(request(path)))).toBeNull();
    }
  });

  it("AC-LND-004 never sends robots.txt to /login", async () => {
    for (const path of ["/robots.txt"]) {
      expect((await proxy(request(path))).headers.get("location")).toBeNull();
    }
  });

  it("AC-LND-014 serves everything as before on staging and development", async () => {
    const response = await proxy(request("/login"));
    expect(rewrittenTo(response)).toBeNull();
    expect(isLandingOnly).toHaveBeenCalled();
  });
});

describe("proxy forwards the gallery token header (C-103, D-7)", () => {
  const FORWARDED = "x-middleware-request-x-shutrly-gallery-token";
  const SESSION = { cookie: "better-auth.session_token=abc" };

  it("AC-L10N-001 forwards the gallery token to the server for /g/<token> paths", async () => {
    const response = await proxy(request("/g/tok-123/photos"));
    expect(response.headers.get(FORWARDED)).toBe("tok-123");
    expect((await proxy(request("/g/tok-123"))).headers.get(FORWARDED)).toBe("tok-123");
  });

  it("C-103 strips a forged token header from every incoming request", async () => {
    const forged = { "x-shutrly-gallery-token": "forged" };
    expect((await proxy(request("/login", forged))).headers.get(FORWARDED)).toBeNull();
    expect(
      (await proxy(request("/w/x", { ...forged, ...SESSION }))).headers.get(FORWARDED),
    ).toBeNull();
  });

  it("C-103 strips a forged token on the landing-only rewrite too", async () => {
    vi.mocked(isLandingOnly).mockResolvedValue(true);
    const forged = { "x-shutrly-gallery-token": "forged" };
    const response = await proxy(request("/w/x", forged));
    expect(rewrittenTo(response)).toBe("http://localhost:3000/_gated");
    expect(response.headers.get(FORWARDED)).toBeNull();
  });

  it("AC-L10N-001 forwards the token through the landing-only rewrite for gallery links", async () => {
    vi.mocked(isLandingOnly).mockResolvedValue(true);
    const response = await proxy(request("/g/tok-123/photos"));
    expect(rewrittenTo(response)).toBe("http://localhost:3000/_gated");
    expect(response.headers.get(FORWARDED)).toBe("tok-123");
  });

  it("C-103 never echoes the token header on the response", async () => {
    const response = await proxy(request("/g/tok-123/photos"));
    expect(response.headers.get("x-shutrly-gallery-token")).toBeNull();
    expect(response.headers.get("location")).toBeNull();
  });
});
