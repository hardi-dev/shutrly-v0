import { describe, expect, it } from "vitest";

import { resolveAccountLocale, resolveGalleryLocale } from "./resolve-locale";

describe("resolveAccountLocale", () => {
  it.each([
    ["AC-L10N-001 a first visit with no cookie and no session resolves en", null, undefined, "en"],
    ["BR-L10N-001 a signed-in owner's user.locale wins over the device cookie", "id", "en", "id"],
    ["BR-L10N-001 a valid device cookie applies before sign-in", null, "id", "id"],
    ["BR-L10N-001 an invalid cookie is ignored as if absent", null, "fr", "en"],
    ["BR-L10N-001 an empty cookie is ignored as if absent", null, "", "en"],
  ] as const)("%s", (_name, ownerLocale, deviceCookie, expected) => {
    expect(resolveAccountLocale({ ownerLocale, deviceCookie })).toBe(expected);
  });

  it("BR-L10N-001 Accept-Language is never an input", () => {
    const input = { ownerLocale: null, deviceCookie: undefined } as const;
    expect(Object.keys(input)).toEqual(["ownerLocale", "deviceCookie"]);
    expect(resolveAccountLocale(input)).toBe("en");
  });
});

describe("resolveGalleryLocale", () => {
  it.each([
    ["AC-L10N-001 a gallery cookie wins over the owner locale", "id", "en", "id"],
    [
      "AC-L10N-001 a client without a cookie follows the owner's current locale",
      undefined,
      "id",
      "id",
    ],
    ["AC-L10N-001 a first gallery visit with no owner resolves en", undefined, null, "en"],
    ["BR-L10N-001 an invalid gallery cookie is ignored as if absent", "fr", "id", "id"],
    ["BR-L10N-001 an unknown token leaves the owner locale null", undefined, null, "en"],
  ] as const)("%s", (_name, clientCookie, ownerLocale, expected) => {
    expect(resolveGalleryLocale({ clientCookie, ownerLocale })).toBe(expected);
  });
});
