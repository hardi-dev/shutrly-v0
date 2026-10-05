import { describe, expect, it } from "vitest";

import { GOOGLE_IMAGE_WIDTHS, googleImageUrl } from "./google-image-url";

describe("googleImageUrl", () => {
  it("AC-GAL-015 builds the tile and preview URLs from the file ID", () => {
    expect(googleImageUrl("1AbCdEfGhIjKlMnOp", GOOGLE_IMAGE_WIDTHS.tile)).toBe(
      "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w600",
    );
    expect(googleImageUrl("1AbCdEfGhIjKlMnOp", GOOGLE_IMAGE_WIDTHS.preview)).toBe(
      "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w1600",
    );
  });

  it("AC-GAL-015 refuses an ID that is not a Drive file ID", () => {
    expect(googleImageUrl("short", 600)).toBeNull();
    expect(googleImageUrl("../etc/passwd=w1", 600)).toBeNull();
    expect(googleImageUrl("1AbCdEfGhIjKlMnOp/evil", 600)).toBeNull();
    expect(googleImageUrl("", 600)).toBeNull();
  });
});
