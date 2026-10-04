import { describe, expect, it } from "vitest";

import { browseCrumbs, kindVisibility, searchMeta } from "./browse-text";

const AT = { kind: "PROOF" as const, sourceId: "s-1", path: "Akad", search: "" };

describe("browse text", () => {
  it("AC-GAL-030 reads Semua folder › Rina-Wisuda › Akad with the last one current", () => {
    const crumbs = browseCrumbs(AT, "Rina-Wisuda");
    expect(crumbs.map((crumb) => crumb.label)).toEqual(["Semua folder", "Rina-Wisuda", "Akad"]);
    expect(crumbs[1].target).toEqual({ ...AT, path: "" });
    expect(crumbs[2].target).toBeNull();
  });

  it("AC-GAL-028 shows only Semua folder at the top", () => {
    expect(browseCrumbs({ ...AT, sourceId: null, path: "" }, null)).toEqual([
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
      driveUrl: null,
    };
    expect(searchMeta(photo)).toBe("Rina-Wisuda › Akad · edited");
    expect(searchMeta({ ...photo, kind: "PROOF", browsePath: "" })).toBe("Rina-Wisuda · proof");
  });

  it("AC-GAL-014 marks proof by status and edited as hidden until delivery", () => {
    expect(kindVisibility("PROOF", "PUBLISHED")).toBe("Terlihat oleh klien sekarang.");
    expect(kindVisibility("EDITED", "PUBLISHED")).toMatch(/^Disembunyikan dari klien/);
  });
});
