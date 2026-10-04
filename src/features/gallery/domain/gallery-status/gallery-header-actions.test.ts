import { describe, expect, it } from "vitest";

import { galleryHeaderActions } from "./gallery-header-actions";

describe("galleryHeaderActions", () => {
  it("AC-GAL-016 a draft publishes and its menu changes expiry, password or deletes", () => {
    expect(galleryHeaderActions("DRAFT", "BOOKED")).toEqual({
      primary: "PUBLISH",
      menu: ["CHANGE_EXPIRY", "ROTATE_PASSWORD", "DELETE"],
    });
  });

  it("AC-GAL-022 a published gallery has only a menu, with archive", () => {
    expect(galleryHeaderActions("PUBLISHED", "SHOOTING")).toEqual({
      primary: null,
      menu: ["CHANGE_EXPIRY", "ROTATE_PASSWORD", "ARCHIVE"],
    });
  });

  it("AC-GAL-020 an expired gallery leads with Ubah kedaluwarsa", () => {
    expect(galleryHeaderActions("EXPIRED", "DELIVERED")).toEqual({
      primary: "CHANGE_EXPIRY",
      menu: ["ROTATE_PASSWORD", "ARCHIVE"],
    });
  });

  it("AC-GAL-022 AC-GAL-024 offers nothing when archived, and only deletion for a cancelled draft", () => {
    expect(galleryHeaderActions("ARCHIVED", "BOOKED")).toEqual({ primary: null, menu: [] });
    expect(galleryHeaderActions("DRAFT", "CANCELLED")).toEqual({ primary: "DELETE", menu: [] });
    expect(galleryHeaderActions("ARCHIVED", "CANCELLED")).toEqual({ primary: null, menu: [] });
  });
});
