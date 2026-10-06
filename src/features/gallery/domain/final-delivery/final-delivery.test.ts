import { describe, expect, it } from "vitest";

import { deliveryCardState, galleryDeliveryReasons } from "./final-delivery";
import type { DeliveryCardFacts } from "./final-delivery.types";

describe("galleryDeliveryReasons (BR-DEL-003, A-17)", () => {
  it("AC-DEL-001 a published gallery with a finished file has no reason", () => {
    expect(galleryDeliveryReasons({ status: "PUBLISHED", finishedCount: 3 })).toEqual([]);
  });

  it("AC-DEL-002 no finished file is refused", () => {
    expect(galleryDeliveryReasons({ status: "PUBLISHED", finishedCount: 0 })).toEqual([
      "NO_FINISHED_FILE",
    ]);
  });

  it.each(["EXPIRED", "DRAFT", "ARCHIVED", null] as const)(
    "AC-DEL-002 a %s gallery is refused",
    (status) => {
      expect(galleryDeliveryReasons({ status, finishedCount: 2 })).toEqual([
        "GALLERY_NOT_PUBLISHED",
      ]);
    },
  );

  it("AC-DEL-002 lists every reason at once", () => {
    expect(galleryDeliveryReasons({ status: "EXPIRED", finishedCount: 0 })).toEqual([
      "NO_FINISHED_FILE",
      "GALLERY_NOT_PUBLISHED",
    ]);
  });
});

describe("deliveryCardState (hasilakhirowner-kartu A–E)", () => {
  const READY: DeliveryCardFacts = {
    status: "PUBLISHED",
    finishedCount: 30,
    published: false,
    projectStatus: "POST_PROCESSING",
  };

  it("A: no finished file", () => {
    expect(deliveryCardState({ ...READY, finishedCount: 0 })).toBe("NO_FILES");
  });
  it("B: ready", () => {
    expect(deliveryCardState(READY)).toBe("READY");
  });
  it("C: published", () => {
    expect(deliveryCardState({ ...READY, published: true, projectStatus: "DELIVERED" })).toBe(
      "PUBLISHED",
    );
  });
  it("D: project completed", () => {
    expect(deliveryCardState({ ...READY, published: true, projectStatus: "COMPLETED" })).toBe(
      "COMPLETED",
    );
  });
  it("E: gallery not active", () => {
    expect(deliveryCardState({ ...READY, status: "EXPIRED" })).toBe("GALLERY_INACTIVE");
    expect(deliveryCardState({ ...READY, status: null })).toBe("GALLERY_INACTIVE");
  });
});
