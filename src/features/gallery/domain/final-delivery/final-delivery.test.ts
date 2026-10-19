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

describe("deliveryCardState (F-27 P4, P7)", () => {
  const READY: DeliveryCardFacts = {
    finishedCount: 30,
    published: false,
    projectStatus: "POST_PROCESSING",
  };

  it("no finished file shows no files", () => {
    expect(deliveryCardState({ ...READY, finishedCount: 0 })).toBe("NO_FILES");
  });
  it("AC-GFL-019 finished files with no delivery yet are ready, whatever the gallery", () => {
    expect(deliveryCardState(READY)).toBe("READY");
  });
  it("AC-GFL-017 a recorded delivery shows as delivered", () => {
    expect(deliveryCardState({ ...READY, published: true, projectStatus: "DELIVERED" })).toBe(
      "DELIVERED",
    );
  });
  it("a completed project keeps its delivered summary", () => {
    expect(deliveryCardState({ ...READY, published: true, projectStatus: "COMPLETED" })).toBe(
      "COMPLETED",
    );
  });
});
