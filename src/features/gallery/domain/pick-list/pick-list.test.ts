import { describe, expect, it } from "vitest";

import { formatPickList } from "./pick-list";

describe("formatPickList (A-6)", () => {
  it("AC-SEL-010 writes one file name per line, with the note after a dash", () => {
    expect(
      formatPickList("COUNT", [
        { fileName: "IMG_001.jpg", quantity: 1, note: null },
        { fileName: "IMG_002.jpg", quantity: 1, note: "hapus jerawat" },
      ]),
    ).toBe("IMG_001.jpg\nIMG_002.jpg — hapus jerawat");
  });

  it("AC-SEL-010 writes × n for print quantities, and ignores the quantity in a COUNT group", () => {
    expect(formatPickList("QUANTITY", [{ fileName: "IMG_003.jpg", quantity: 2, note: null }])).toBe(
      "IMG_003.jpg × 2",
    );
    expect(formatPickList("COUNT", [{ fileName: "IMG_003.jpg", quantity: 2, note: null }])).toBe(
      "IMG_003.jpg",
    );
  });

  it("A-6 turns line breaks in a note into spaces so each pick stays on one line", () => {
    expect(
      formatPickList("COUNT", [
        { fileName: "a.jpg", quantity: 1, note: "rapikan\n  rambut\nterang" },
      ]),
    ).toBe("a.jpg — rapikan rambut terang");
  });

  it("returns an empty text for no picks", () => {
    expect(formatPickList("COUNT", [])).toBe("");
  });
});
