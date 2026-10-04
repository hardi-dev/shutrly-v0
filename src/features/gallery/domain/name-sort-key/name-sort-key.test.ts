import { describe, expect, it } from "vitest";

import { nameSortKey } from "./name-sort-key";

describe("nameSortKey", () => {
  it("AC-GAL-012 orders file names naturally, ignoring case", () => {
    const names = ["IMG_010.jpg", "img_003.JPG", "IMG_2.jpg", "IMG_001.jpg", "IMG_10.jpg"];
    const sorted = [...names].sort((a, b) => nameSortKey(a).localeCompare(nameSortKey(b)));
    expect(sorted).toEqual([
      "IMG_001.jpg",
      "IMG_2.jpg",
      "img_003.JPG",
      "IMG_010.jpg",
      "IMG_10.jpg",
    ]);
  });
});
