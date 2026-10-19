import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { GALLERY_COPY_NAMESPACE } from "../gallery-copy/gallery-copy.copy";
import { browseCrumbs, kindVisibility, searchMeta } from "./browse-text";

const t = copyTranslator(GALLERY_COPY_NAMESPACE, "id");

const AT = { kind: "PROOF" as const, sourceId: "s-1", path: "Akad", search: "" };

describe("browse text", () => {
  it("AC-GAL-030 reads Semua folder › Rina-Wisuda › Akad with the last one current", () => {
    const crumbs = browseCrumbs(t, AT, "Rina-Wisuda");
    expect(crumbs.map((crumb) => crumb.label)).toEqual(["Semua folder", "Rina-Wisuda", "Akad"]);
    expect(crumbs[1].target).toEqual({ ...AT, path: "" });
    expect(crumbs[2].target).toBeNull();
  });

  it("AC-GAL-028 shows only Semua folder at the top", () => {
    expect(browseCrumbs(t, { ...AT, sourceId: null, path: "" }, null)).toEqual([
      { label: "Semua folder", target: null },
    ]);
  });

  it("AC-GAL-029 labels a search result with its folder and kind", () => {
    const photo = {
      id: "p",
      fileName: "IMG_027.jpg",
      kind: "EDITED" as const,
      folderPath: "Akad/edited",
      browsePath: "Akad",
      sourceId: "s-1",
      sourceName: "Rina-Wisuda",
      missing: false,
      externalFileId: "1AbCdEfGhIjKlMnOp",
      provider: "GOOGLE_DRIVE" as const,
      driveUrl: null,
    };
    expect(searchMeta(t, photo)).toBe("Rina-Wisuda › Akad · hasil edit");
    expect(searchMeta(t, { ...photo, kind: "PROOF", browsePath: "" })).toBe(
      "Rina-Wisuda · pilihan",
    );
  });

  it("AC-GAL-014 marks proof by status and edited as hidden until delivery", () => {
    expect(kindVisibility(t, "PROOF", "OPEN")).toBe(
      "Terlihat oleh klien yang punya link dan kata sandi.",
    );
    expect(kindVisibility(t, "EDITED", "OPEN")).toBe(
      "Disembunyikan sampai hasil akhir dipublikasikan. File berasal dari subfolder yang dipetakan ke item paket Hasil edit.",
    );
  });
});
