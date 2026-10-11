import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { DELIVERY_SCREEN_COPY_NAMESPACE } from "./delivery-screen.copy";
import { failedBody, groupMeta, viewerMeta } from "./delivery-screen-text";

const t = copyTranslator(DELIVERY_SCREEN_COPY_NAMESPACE, "id");

describe("Hasil akhir text (klien-8, F-21)", () => {
  it("F-21 names the open item's files", () => {
    expect(groupMeta(t, "Foto edit", 24)).toBe("24 file · Foto edit");
  });

  it("AC-DEL-005 names the failed files", () => {
    expect(failedBody(t, ["E_002.jpg"])).toBe(
      "E_002.jpg tidak bisa diunduh. Foto lain sudah masuk.",
    );
  });

  it("counts the preview's position", () => {
    expect(viewerMeta(t, "Foto edit", 2, 24)).toBe("Hasil akhir · Foto edit · 3 dari 24");
  });
});
