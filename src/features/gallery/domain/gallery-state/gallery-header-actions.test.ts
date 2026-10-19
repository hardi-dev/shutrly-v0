import { describe, expect, it } from "vitest";

import { galleryHeaderActions } from "./gallery-header-actions";

describe("galleryHeaderActions", () => {
  it("AC-GFL-006 an open gallery has no primary action, only the menu", () => {
    expect(galleryHeaderActions("OPEN")).toEqual({
      primary: null,
      menu: ["CHANGE_EXPIRY", "ROTATE_PASSWORD"],
    });
  });

  it("AC-GFL-012 an expired gallery leads with *Ubah kedaluwarsa*", () => {
    expect(galleryHeaderActions("EXPIRED")).toEqual({
      primary: "CHANGE_EXPIRY",
      menu: ["ROTATE_PASSWORD"],
    });
  });

  it("AC-GFL-016 a closed gallery offers nothing", () => {
    expect(galleryHeaderActions("CLOSED")).toEqual({ primary: null, menu: [] });
  });
});
