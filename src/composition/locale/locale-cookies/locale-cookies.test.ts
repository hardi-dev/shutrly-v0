import { beforeEach, describe, expect, it, vi } from "vitest";

type StoredCookie = { readonly value: string };
type SetArg = { readonly value: string; readonly path: string };

const jar = vi.hoisted(() => ({
  get: vi.fn<(name: string) => StoredCookie | undefined>(),
  set: vi.fn<(arg: SetArg) => void>(),
}));

vi.mock("next/headers", () => ({ cookies: vi.fn(() => jar) }));

import {
  DEVICE_LOCALE_COOKIE,
  GALLERY_LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  readDeviceLocaleCookie,
  readGalleryLocaleCookie,
  writeDeviceLocaleCookie,
  writeGalleryLocaleCookie,
} from "./locale-cookies";

describe("locale cookies", () => {
  beforeEach(() => {
    jar.get.mockReset();
    jar.set.mockReset();
  });

  it("BR-L10N-001 writes the device cookie for the whole site for one year", async () => {
    await writeDeviceLocaleCookie("id");
    expect(jar.set).toHaveBeenCalledWith({
      name: DEVICE_LOCALE_COOKIE,
      value: "id",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    });
    expect(LOCALE_COOKIE_MAX_AGE_SECONDS).toBe(31_536_000);
  });

  it("AC-L10N-001 scopes the gallery cookie to its own link path", async () => {
    await writeGalleryLocaleCookie("tok-123", "en");
    expect(jar.set).toHaveBeenCalledWith(
      expect.objectContaining({
        name: GALLERY_LOCALE_COOKIE,
        path: "/g/tok-123",
        value: "en",
      }),
    );
  });

  it("C-103 the cookie holds only the locale value", async () => {
    await writeDeviceLocaleCookie("en");
    await writeGalleryLocaleCookie("tok-123", "id");
    for (const [arg] of jar.set.mock.calls) {
      expect(["en", "id"]).toContain(arg.value);
      expect(arg.value).not.toContain("tok-123");
    }
  });

  it("BR-L10N-001 reads the device and gallery cookie values as sent", async () => {
    jar.get.mockImplementation((name: string) =>
      name === DEVICE_LOCALE_COOKIE ? { value: "id" } : { value: "en" },
    );
    await expect(readDeviceLocaleCookie()).resolves.toBe("id");
    await expect(readGalleryLocaleCookie()).resolves.toBe("en");
  });

  it("BR-L10N-001 reads undefined when the cookie is absent", async () => {
    jar.get.mockReturnValue(undefined);
    await expect(readDeviceLocaleCookie()).resolves.toBeUndefined();
  });
});
