import { describe, expect, it } from "vitest";

import { imageSources } from "./gallery-image-sources";

const PHOTO = { id: "p-1", externalFileId: "1AbCdEfGhIjKlMnOp", provider: "GOOGLE_DRIVE" as const };

describe("imageSources", () => {
  it("AC-GAL-015 loads from Google first and keeps the Owner route as the fallback", () => {
    expect(imageSources(PHOTO, "thumb", "ws-1", true)).toEqual({
      src: "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w600",
      fallbackSrc: "/api/w/ws-1/gallery-photos/p-1/thumb",
    });
    expect(imageSources(PHOTO, "preview", "ws-1", true).src).toBe(
      "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w1600",
    );
  });

  it("AC-GAL-015 uses the Owner route alone when Google images are off", () => {
    expect(imageSources(PHOTO, "thumb", "ws-1", false)).toEqual({
      src: "/api/w/ws-1/gallery-photos/p-1/thumb",
    });
  });

  it("AC-GAL-015 uses the Owner route alone for a provider with no direct image URL", () => {
    expect(imageSources({ ...PHOTO, provider: "DROPBOX" }, "thumb", "ws-1", true)).toEqual({
      src: "/api/w/ws-1/gallery-photos/p-1/thumb",
    });
  });

  it("AC-GAL-015 uses the Owner route alone for an ID that isn't a Drive ID", () => {
    expect(
      imageSources(
        { id: "p-2", externalFileId: "x", provider: "GOOGLE_DRIVE" as const },
        "thumb",
        "ws-1",
        true,
      ),
    ).toEqual({
      src: "/api/w/ws-1/gallery-photos/p-2/thumb",
    });
  });
});
