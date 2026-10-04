import { describe, expect, it } from "vitest";

import { previewMeta } from "./photo-preview-meta";

const PHOTO = {
  id: "p",
  fileName: "A_012.jpg",
  kind: "PROOF" as const,
  folderPath: "Akad",
  browsePath: "Akad",
  sourceId: "s",
  sourceName: "Rina-Wisuda",
  missing: false,
  driveUrl: "https://drive.google.com/file/d/x/view",
};

describe("previewMeta", () => {
  it("AC-GAL-031 reads folder, kind and position", () => {
    expect(previewMeta(PHOTO, 12, 64)).toBe("Rina-Wisuda › Akad · Proof · 12 dari 64");
  });

  it("AC-GAL-031 adds Hilang for a missing photo", () => {
    expect(previewMeta({ ...PHOTO, browsePath: "", missing: true }, 2, 13)).toBe(
      "Rina-Wisuda · Proof · Hilang · 2 dari 13",
    );
  });
});
