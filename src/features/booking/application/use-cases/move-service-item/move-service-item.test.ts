import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { addServiceItem } from "../add-service-item/add-service-item";
import { moveServiceItem } from "./move-service-item";

describe("moveServiceItem", () => {
  it("AC-CAT-016 swaps package order and makes a boundary move a no-op", async () => {
    const { services, definitions, serviceId } = await serviceFixture();
    const first = definitions.rows[0]?.id;
    const second = definitions.rows[1]?.id;
    if (!first || !second) throw new Error("fixture");
    await addServiceItem(services, definitions, bookingContext, serviceId, first, "user", {
      type: "NUMBER",
      value: "1",
    });
    await addServiceItem(services, definitions, bookingContext, serviceId, second, "user", {
      type: "NUMBER",
      value: "2",
    });
    const firstId = services.rows[0]?.items[0]?.id;
    const secondId = services.rows[0]?.items[1]?.id;
    if (!firstId || !secondId) throw new Error("fixture");
    expect(await moveServiceItem(services, bookingContext, serviceId, secondId, "UP")).toEqual({
      ok: true,
    });
    expect(services.rows[0]?.items.map(({ id }) => id)).toEqual([secondId, firstId]);
    expect(await moveServiceItem(services, bookingContext, serviceId, secondId, "UP")).toEqual({
      ok: true,
    });
  });
});
