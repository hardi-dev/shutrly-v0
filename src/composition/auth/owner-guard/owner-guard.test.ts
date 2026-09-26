import { describe, expect, it, vi } from "vitest";

vi.mock("../auth-scope/auth-scope", () => ({ withAuthScope: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

import { AuthError } from "@/features/auth/application/errors/auth-errors/auth-errors";

import { ownerRedirectFor, redirectOnRefusal } from "./owner-guard";

describe("owner guard", () => {
  it("AC-AUTH-009 AC-AUTH-013 sends each refusal to its screen", () => {
    expect(ownerRedirectFor("AUTH_REQUIRED")).toBe("/login");
    expect(ownerRedirectFor("EMAIL_UNVERIFIED")).toBe("/verify");
    expect(ownerRedirectFor("ACCOUNT_UNAVAILABLE")).toBe("/account-unavailable");
  });

  it("AC-AUTH-014 turns a refusal into a redirect and lets other errors through", async () => {
    const refused = () => Promise.reject(new AuthError("ACCOUNT_UNAVAILABLE"));
    await expect(redirectOnRefusal(refused)).rejects.toThrow("redirect:/account-unavailable");
    const broken = () => Promise.reject(new Error("db down"));
    await expect(redirectOnRefusal(broken)).rejects.toThrow("db down");
  });
});
