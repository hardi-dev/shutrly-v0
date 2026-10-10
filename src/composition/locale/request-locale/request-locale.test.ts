import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  requestHeaders: new Headers(),
  cookies: new Map<string, string>(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(state.requestHeaders)),
  cookies: vi.fn(() =>
    Promise.resolve({
      get: (name: string) => {
        const value = state.cookies.get(name);
        return value === undefined ? undefined : { value };
      },
      set: vi.fn(),
    }),
  ),
}));

import { GALLERY_TOKEN_HEADER } from "@/shared/gallery-token/gallery-token-header";

const ownerLookup = vi.hoisted(() => ({ signedIn: null as "en" | "id" | null }));
const galleryLookup = vi.hoisted(() => vi.fn(() => Promise.resolve<"en" | "id" | null>(null)));

vi.mock("@/composition/auth/owner-locale/owner-locale", () => ({
  loadSignedInOwnerLocale: vi.fn(() => Promise.resolve(ownerLookup.signedIn)),
}));
vi.mock("@/composition/gallery/gallery-owner-locale/gallery-owner-locale", () => ({
  loadGalleryOwnerLocale: galleryLookup,
}));

import { getRequestLocale } from "./request-locale";

function setRequest(cookies: Record<string, string>, galleryToken?: string) {
  state.cookies = new Map(Object.entries(cookies));
  state.requestHeaders = new Headers();
  if (galleryToken) state.requestHeaders.set(GALLERY_TOKEN_HEADER, galleryToken);
}

describe("getRequestLocale", () => {
  beforeEach(() => {
    setRequest({});
  });

  it("AC-L10N-001 resolves en on a first visit", async () => {
    expect(await getRequestLocale()).toBe("en");
  });

  it("BR-L10N-001 uses the device cookie on account surfaces", async () => {
    setRequest({ shutrly_locale: "id" });
    expect(await getRequestLocale()).toBe("id");
  });

  it("AC-L10N-001 uses the gallery cookie only when the gallery header is present", async () => {
    setRequest({ shutrly_gallery_locale: "id", shutrly_locale: "en" });
    expect(await getRequestLocale()).toBe("en");
    setRequest({ shutrly_gallery_locale: "id", shutrly_locale: "en" }, "tok-123");
    expect(await getRequestLocale()).toBe("id");
  });

  it("AC-L10N-004 two calls with different cookies resolve independently", async () => {
    setRequest({ shutrly_locale: "id" });
    const first = await getRequestLocale();
    setRequest({ shutrly_locale: "en" });
    const second = await getRequestLocale();
    expect(first).toBe("id");
    expect(second).toBe("en");
  });

  it("AC-L10N-001 a valid gallery cookie skips the owner lookup", async () => {
    setRequest({ shutrly_gallery_locale: "id" }, "tok-123");
    galleryLookup.mockClear();
    expect(await getRequestLocale()).toBe("id");
    expect(galleryLookup).not.toHaveBeenCalled();
  });

  it("AC-L10N-001 without a valid gallery cookie the gallery owner's locale applies", async () => {
    setRequest({}, "tok-123");
    galleryLookup.mockResolvedValueOnce("id");
    expect(await getRequestLocale()).toBe("id");
    expect(galleryLookup).toHaveBeenCalledWith("tok-123");
  });

  it("BR-L10N-001 a signed-in owner's locale wins over the device cookie on account screens", async () => {
    setRequest({ shutrly_locale: "en" });
    ownerLookup.signedIn = "id";
    expect(await getRequestLocale()).toBe("id");
    ownerLookup.signedIn = null;
  });
});
