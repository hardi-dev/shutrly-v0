import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { GALLERY_COPY_NAMESPACE } from "../gallery-copy/gallery-copy.copy";
import { previewMeta } from "./photo-preview-meta";

const t = copyTranslator(GALLERY_COPY_NAMESPACE, "id");

const PHOTO = {
  id: "p",
  fileName: "A_012.jpg",
  kind: "PROOF" as const,
  folderPath: "Akad",
  browsePath: "Akad",
  sourceId: "s",
  sourceName: "Rina-Wisuda",
  missing: false,
  externalFileId: "1AbCdEfGhIjKlMnOp",
  provider: "GOOGLE_DRIVE" as const,
  driveUrl: "https://drive.google.com/file/d/x/view",
};

describe("previewMeta", () => {
  it("AC-GAL-031 reads folder, kind and position", () => {
    expect(previewMeta(t, PHOTO, 12, 64)).toBe("Rina-Wisuda › Akad · Foto pilihan · 12 dari 64");
  });

  it("AC-GAL-031 adds Hilang for a missing photo", () => {
    expect(previewMeta(t, { ...PHOTO, browsePath: "", missing: true }, 2, 13)).toBe(
      "Rina-Wisuda · Foto pilihan · Hilang · 2 dari 13",
    );
  });

  it("design shows only the innermost folder on phones", () => {
    expect(previewMeta(t, PHOTO, 12, 64, true)).toBe("Akad · Foto pilihan · 12 dari 64");
    expect(previewMeta(t, { ...PHOTO, browsePath: "" }, 1, 28, true)).toBe(
      "Rina-Wisuda · Foto pilihan · 1 dari 28",
    );
  });
});
