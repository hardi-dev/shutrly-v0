import { describe, expect, it } from "vitest";

import { deliveryCardState, galleryDeliveryReasons } from "./final-delivery";
import type { DeliveryCardFacts } from "./final-delivery.types";

describe("galleryDeliveryReasons (BR-DEL-003, BR-DEL-002)", () => {
  it("AC-GFL-017 a synced finished file has no reason, whatever the gallery's state", () => {
    expect(galleryDeliveryReasons({ finishedCount: 3 })).toEqual([]);
  });

  it("AC-GFL-017 no synced finished file is refused", () => {
    expect(galleryDeliveryReasons({ finishedCount: 0 })).toEqual(["NO_FINISHED_FILE"]);
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
