import { describe, expect, it } from "vitest";

import { directImageUrl } from "./source-image";

describe("directImageUrl", () => {
  it("AC-GAL-015 gives Google Drive photos Google's image URL at the tile and preview widths", () => {
    expect(directImageUrl("GOOGLE_DRIVE", "1AbCdEfGhIjKlMnOp", "thumb")).toBe(
      "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w600",
    );
    expect(directImageUrl("GOOGLE_DRIVE", "1AbCdEfGhIjKlMnOp", "preview")).toBe(
      "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w1600",
    );
  });

  it("AC-GAL-015 gives a provider with no direct URL nothing, so it uses the media route", () => {
    for (const provider of ["DROPBOX", "ONEDRIVE", "AMAZON_S3", "CUSTOM_URL"] as const) {
      expect(directImageUrl(provider, "1AbCdEfGhIjKlMnOp", "thumb")).toBeNull();
    }
  });

  it("AC-GAL-015 gives a Google Drive file with a malformed ID nothing", () => {
    expect(directImageUrl("GOOGLE_DRIVE", "../x", "thumb")).toBeNull();
  });
});
