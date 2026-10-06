import { describe, expect, it } from "vitest";

import { failedBody, kindMeta, viewerMeta } from "./delivery-screen-text";

describe("Hasil akhir text (klien-8)", () => {
  it("names the open kind's files", () => {
    expect(kindMeta("EDITED", 24)).toBe("24 foto Edited");
    expect(kindMeta("PRINT", 6)).toBe("6 file Print");
  });

  it("AC-DEL-005 names the failed files", () => {
    expect(failedBody(["E_002.jpg"])).toBe("E_002.jpg tidak bisa diunduh. Foto lain sudah masuk.");
  });

  it("counts the preview's position", () => {
    expect(viewerMeta("EDITED", 2, 24)).toBe("Hasil akhir · Edited · 3 dari 24");
  });
});
