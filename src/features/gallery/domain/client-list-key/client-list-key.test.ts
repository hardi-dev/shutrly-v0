import { describe, expect, it } from "vitest";

import { clientListKey } from "./client-list-key";

const PARTS = {
  galleryId: "g1",
  contentVersion: 3,
  kind: "PROOF" as const,
  sourceId: "s1",
  path: "Akad/Sesi 1",
  search: "",
  cursor: null,
};

describe("clientListKey (D-22)", () => {
  it("starts with the gallery and its content version", () => {
    expect(clientListKey(PARTS)).toBe("g1:3:PROOF:s1:Akad%2FSesi%201::");
  });

  it("a new content version is a new key", () => {
    expect(clientListKey({ ...PARTS, contentVersion: 4 })).not.toBe(clientListKey(PARTS));
  });

  it("separates pages and kinds", () => {
    const next = clientListKey({ ...PARTS, cursor: { sortKey: "img_048.jpg", id: "p48" } });
    expect(next).toBe("g1:3:PROOF:s1:Akad%2FSesi%201::img_048.jpg%7Cp48");
    expect(clientListKey({ ...PARTS, kind: "EDITED" })).toContain(":EDITED:");
  });
});
