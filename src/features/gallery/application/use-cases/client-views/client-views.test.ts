import { describe, expect, it } from "vitest";

import { toClientPhotoView } from "./client-views";

const PHOTO = {
  id: "p-1",
  fileName: "IMG_001.jpg",
  folderPath: "Akad",
  externalFileId: "1AbCdEfGhIjKlMnOp",
  provider: "GOOGLE_DRIVE" as const,
  missing: false,
};

describe("toClientPhotoView (D-15)", () => {
  it("AC-ACC-013 loads from Google with the client media route as fallback", () => {
    expect(toClientPhotoView(PHOTO, "T1", true)).toEqual({
      id: "p-1",
      fileName: "IMG_001.jpg",
      folderPath: "Akad",
      thumb: {
        src: "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w600",
        fallbackSrc: "/g/T1/media/p-1/thumb",
      },
      preview: {
        src: "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w1600",
        fallbackSrc: "/g/T1/media/p-1/preview",
      },
      missing: false,
    });
  });

  it("AC-ACC-012 never carries a Drive link or resource key, and uses the route alone when direct images are off", () => {
    const view = toClientPhotoView(PHOTO, "T1", false);
    expect(view.thumb).toEqual({ src: "/g/T1/media/p-1/thumb" });
    expect(JSON.stringify(view)).not.toContain("drive.google.com");
    expect(Object.keys(view)).not.toContain("externalFileId");
  });
});
