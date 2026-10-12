import { beforeEach, describe, expect, it, vi } from "vitest";

const writeDeviceLocaleCookie = vi.hoisted(() => vi.fn(() => Promise.resolve()));

const updateOwnerLocaleUseCase = vi.hoisted(() => vi.fn());

vi.mock("../locale-cookies/locale-cookies", () => ({ writeDeviceLocaleCookie }));
vi.mock("@/composition/auth/auth-scope/auth-scope", () => ({
  withAuthScope: (work: (scope: unknown) => Promise<unknown>) =>
    work({ meta: { headers: new Headers() } }),
}));
vi.mock("@/composition/auth/owner-guard/owner-guard", () => ({
  redirectOnRefusal: (work: () => Promise<unknown>) => work(),
}));
vi.mock("@/features/auth/application/use-cases/update-owner-locale/update-owner-locale", () => ({
  updateOwnerLocale: updateOwnerLocaleUseCase,
}));

const galleryDeps = vi.hoisted(() => ({
  record: null as null | object,
  hit: vi.fn(() => Promise.resolve(true)),
}));
const writeGalleryLocaleCookie = vi.hoisted(() => vi.fn(() => Promise.resolve()));

vi.mock("../locale-cookies/locale-cookies", () => ({
  writeDeviceLocaleCookie,
  writeGalleryLocaleCookie,
}));
vi.mock("@/composition/gallery/client-access-flow/client-access-flow", () => ({
  withClientScope: (work: (deps: unknown, rc: unknown) => Promise<unknown>) =>
    work(
      {
        repository: {
          findByTokenUnscoped: vi.fn(() => Promise.resolve(galleryDeps.record)),
          findOwnerLocaleByTokenUnscoped: vi.fn(() => Promise.resolve(null)),
        },
        rateLimiter: { hit: galleryDeps.hit, peek: vi.fn(() => Promise.resolve(true)) },
        now: new Date("2026-10-10T10:00:00Z"),
      },
      { ip: "203.0.113.7" },
    ),
}));

import { setDeviceLocale, setGalleryLocale, updateOwnerLocale } from "./locale-flow";

const TOKEN = "A".repeat(43);
const AVAILABLE = {
  workspaceId: "w",
  projectId: "p",
  projectStatus: "POST_PROCESSING",
  projectTitle: "t",
  clientFirstName: "Rina",
  studioName: "Studio",
  galleryId: "g",
  galleryStatus: "PUBLISHED",
  expiresAt: null,
  passwordHash: null,
  passwordVersion: null,
  contentVersion: 1,
  finalDeliveryPublishedAt: null,
};

describe("updateOwnerLocale", () => {
  beforeEach(() => {
    writeDeviceLocaleCookie.mockClear();
    updateOwnerLocaleUseCase.mockReset();
  });

  it("D-22 an owner switch also writes the device cookie", async () => {
    updateOwnerLocaleUseCase.mockResolvedValue({ ok: true });
    expect(await updateOwnerLocale({ locale: "id" })).toEqual({ ok: true });
    expect(writeDeviceLocaleCookie).toHaveBeenCalledWith("id");
  });

  it("D-22 a refused owner switch writes no cookie", async () => {
    updateOwnerLocaleUseCase.mockResolvedValue({ ok: false, code: "VALIDATION_FAILED" });
    expect(await updateOwnerLocale({ locale: "fr" })).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
    });
    expect(writeDeviceLocaleCookie).not.toHaveBeenCalled();
  });
});

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

  it("C-104 writes the gallery cookie only for an available gallery", async () => {
    galleryDeps.record = AVAILABLE;
    writeGalleryLocaleCookie.mockClear();
    expect(await setGalleryLocale(TOKEN, { locale: "id" })).toEqual({ ok: true });
    expect(writeGalleryLocaleCookie).toHaveBeenCalledWith(TOKEN, "id");
  });

  it("C-104 an unknown token writes nothing and counts toward the token limit", async () => {
    galleryDeps.record = null;
    galleryDeps.hit.mockClear();
    writeGalleryLocaleCookie.mockClear();
    expect(await setGalleryLocale(TOKEN, { locale: "id" })).toEqual({ ok: false });
    expect(writeGalleryLocaleCookie).not.toHaveBeenCalled();
    expect(galleryDeps.hit).toHaveBeenCalledTimes(1);
  });

  it("D-5 the gallery cookie is written for the link's own token", async () => {
    galleryDeps.record = AVAILABLE;
    writeGalleryLocaleCookie.mockClear();
    await setGalleryLocale(TOKEN, { locale: "en" });
    expect(writeGalleryLocaleCookie).toHaveBeenCalledWith(TOKEN, "en");
  });
});
