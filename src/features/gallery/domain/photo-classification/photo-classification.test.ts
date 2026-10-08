import { describe, expect, it } from "vitest";

import { classifyPhoto, isImageMime, kindForPickMode } from "./photo-classification";

const EDIT = { path: "Hasil Edit", kind: "EDITED" as const, projectItemId: "item-edit" };
const PRINT = { path: "Akad/Cetak 4R", kind: "PRINT" as const, projectItemId: "item-print" };

describe("classifyPhoto (F-21)", () => {
  it("F-21 without a mapping everything is a PROOF, whatever the folder is called", () => {
    expect(classifyPhoto([])).toEqual({ kind: "PROOF", browsePath: "", projectItemId: null });
    expect(classifyPhoto(["edited"])).toEqual({
      kind: "PROOF",
      browsePath: "edited",
      projectItemId: null,
    });
  });

  it("F-21 a mapped subfolder and its children deliver for the item, folded out of the browse path", () => {
    expect(classifyPhoto(["Hasil Edit"], [EDIT])).toEqual({
      kind: "EDITED",
      browsePath: "",
      projectItemId: "item-edit",
    });
    expect(classifyPhoto(["Hasil Edit", "Akad"], [EDIT])).toEqual({
      kind: "EDITED",
      browsePath: "Akad",
      projectItemId: "item-edit",
    });
    expect(classifyPhoto(["Akad", "Cetak 4R"], [EDIT, PRINT])).toEqual({
      kind: "PRINT",
      browsePath: "Akad",
      projectItemId: "item-print",
    });
  });

  it("F-21 a folder name that only starts like a mapped one stays a PROOF", () => {
    expect(classifyPhoto(["Hasil Edit 2"], [EDIT]).kind).toBe("PROOF");
  });

  it("F-21 the longest mapped folder decides", () => {
    const inner = { path: "Hasil Edit/Print", kind: "PRINT" as const, projectItemId: "item-print" };
    expect(classifyPhoto(["Hasil Edit", "Print"], [EDIT, inner])).toMatchObject({
      kind: "PRINT",
      projectItemId: "item-print",
    });
  });

  it("F-21 COUNT items deliver EDITED, QUANTITY items PRINT", () => {
    expect(kindForPickMode("COUNT")).toBe("EDITED");
    expect(kindForPickMode("QUANTITY")).toBe("PRINT");
  });
});

describe("isImageMime", () => {
  it("A-9 only image/* counts as a photo", () => {
    expect(isImageMime("image/jpeg")).toBe(true);
    expect(isImageMime("application/pdf")).toBe(false);
    expect(isImageMime("video/mp4")).toBe(false);
  });
});
