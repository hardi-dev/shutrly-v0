import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { addServiceItem } from "../add-service-item/add-service-item";
import { removeServiceItem } from "./remove-service-item";

describe("removeServiceItem", () => {
  it("AC-CAT-016 removes a package item", async () => {
    const { services, definitions, serviceId } = await serviceFixture();
    const definitionId = definitions.rows[0]?.id;
    if (!definitionId) throw new Error("fixture");
    await addServiceItem(services, definitions, bookingContext, serviceId, definitionId, "user", {
      type: "NUMBER",
      value: "2",
    });
    const itemId = services.rows[0]?.items[0]?.id;
    if (!itemId) throw new Error("fixture");
    expect(await removeServiceItem(services, bookingContext, serviceId, itemId)).toEqual({
      ok: true,
    });
    expect(services.rows[0]?.items).toHaveLength(0);
  });
});
