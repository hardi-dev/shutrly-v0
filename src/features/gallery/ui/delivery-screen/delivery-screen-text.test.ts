import { describe, expect, it } from "vitest";

import { failedBody, groupMeta, viewerMeta } from "./delivery-screen-text";

describe("Hasil akhir text (klien-8, F-20)", () => {
  it("F-20 names the open item's files", () => {
    expect(groupMeta("Foto edit", 24)).toBe("24 file · Foto edit");
  });

  it("AC-DEL-005 names the failed files", () => {
    expect(failedBody(["E_002.jpg"])).toBe("E_002.jpg tidak bisa diunduh. Foto lain sudah masuk.");
  });

  it("counts the preview's position", () => {
    expect(viewerMeta("Foto edit", 2, 24)).toBe("Hasil akhir · Foto edit · 3 dari 24");
  });
});
