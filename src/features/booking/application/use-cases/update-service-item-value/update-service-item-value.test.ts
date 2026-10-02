import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { addServiceItem } from "../add-service-item/add-service-item";
import { updateServiceItemValue } from "./update-service-item-value";

describe("updateServiceItemValue", () => {
  it("AC-CAT-016 updates a package value", async () => {
    const { services, definitions, serviceId } = await serviceFixture();
    const definitionId = definitions.rows[0]?.id;
    if (!definitionId) throw new Error("fixture");
    await addServiceItem(services, definitions, bookingContext, serviceId, definitionId, "user", {
      type: "NUMBER",
      value: "2",
    });
    const itemId = services.rows[0]?.items[0]?.id;
    if (!itemId) throw new Error("fixture");
    expect(
      await updateServiceItemValue(
        services,
        definitions,
        bookingContext,
        serviceId,
        itemId,
        definitionId,
        "user",
        { type: "NUMBER", value: "3" },
      ),
    ).toEqual({ ok: true });
    expect(services.rows[0]?.items[0]?.value).toEqual({ type: "NUMBER", value: "3" });
  });
});
