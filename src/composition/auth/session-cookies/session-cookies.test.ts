import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import { parseSetCookie } from "./session-cookies";

describe("parseSetCookie", () => {
  it("AC-AUTH-007 reads the name, value and attributes of a Better Auth session cookie", () => {
    const raw =
      "better-auth.session_token=abc.def; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax";
    expect(parseSetCookie(raw)).toEqual({
      name: "better-auth.session_token",
      value: "abc.def",
      maxAge: 604800,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  });

  it("AC-AUTH-012 keeps '=' inside the value and reads a deletion cookie", () => {
    expect(parseSetCookie("a=b=c; Max-Age=0; Path=/")).toMatchObject({
      name: "a",
      value: "b=c",
      maxAge: 0,
    });
  });
});
