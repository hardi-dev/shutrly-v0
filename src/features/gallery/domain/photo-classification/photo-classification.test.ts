import { describe, expect, it } from "vitest";

import { classifyPhoto, isImageMime } from "./photo-classification";

describe("classifyPhoto", () => {
  it("AC-GAL-005 root and other subfolders are PROOF", () => {
    expect(classifyPhoto([])).toEqual({ kind: "PROOF", browsePath: "" });
    expect(classifyPhoto(["raw"])).toEqual({ kind: "PROOF", browsePath: "raw" });
  });

  it("AC-GAL-005 edited and print at any depth, case-insensitive", () => {
    expect(classifyPhoto(["Edited"])).toEqual({ kind: "EDITED", browsePath: "" });
    expect(classifyPhoto(["print"])).toEqual({ kind: "PRINT", browsePath: "" });
    expect(classifyPhoto(["Edited", "old"])).toEqual({ kind: "EDITED", browsePath: "old" });
  });

  it("AC-GAL-030 folds the edited level into its parent", () => {
    expect(classifyPhoto(["Akad", "edited"])).toEqual({ kind: "EDITED", browsePath: "Akad" });
  });

  it("BR-GAL-007 the nearest ancestor decides", () => {
    expect(classifyPhoto(["edited", "Akad", "print"])).toEqual({
      kind: "PRINT",
      browsePath: "edited/Akad",
    });
  });
});

describe("isImageMime", () => {
  it("A-9 only image/* counts as a photo", () => {
    expect(isImageMime("image/jpeg")).toBe(true);
    expect(isImageMime("application/pdf")).toBe(false);
    expect(isImageMime("video/mp4")).toBe(false);
  });
});
