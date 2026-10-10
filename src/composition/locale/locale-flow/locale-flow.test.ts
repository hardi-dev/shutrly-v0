import { beforeEach, describe, expect, it, vi } from "vitest";

const writeDeviceLocaleCookie = vi.hoisted(() => vi.fn(() => Promise.resolve()));

vi.mock("../locale-cookies/locale-cookies", () => ({ writeDeviceLocaleCookie }));
vi.mock("@/composition/auth/auth-scope/auth-scope", () => ({ withAuthScope: vi.fn() }));
vi.mock("@/composition/auth/owner-guard/owner-guard", () => ({ redirectOnRefusal: vi.fn() }));

import { setDeviceLocale } from "./locale-flow";

describe("setDeviceLocale", () => {
  beforeEach(() => {
    writeDeviceLocaleCookie.mockClear();
  });

  it("BR-L10N-001 writes shutrly_locale for a valid locale", async () => {
    expect(await setDeviceLocale({ locale: "id" })).toEqual({ ok: true });
    expect(writeDeviceLocaleCookie).toHaveBeenCalledWith("id");
  });

  it("BR-L10N-001 refuses an invalid locale without writing a cookie", async () => {
    expect(await setDeviceLocale({ locale: "fr" })).toEqual({ ok: false });
    expect(await setDeviceLocale(null)).toEqual({ ok: false });
    expect(writeDeviceLocaleCookie).not.toHaveBeenCalled();
  });
});
