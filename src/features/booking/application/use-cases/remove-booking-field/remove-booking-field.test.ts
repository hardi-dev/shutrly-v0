import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { addBookingField } from "../add-booking-field/add-booking-field";
import { removeBookingField } from "./remove-booking-field";

describe("removeBookingField", () => {
  it("AC-CAT-016 removes a booking field", async () => {
    const { services, serviceId } = await serviceFixture();
    await addBookingField(services, bookingContext, serviceId, "user", {
      name: "Nama",
      fieldType: "TEXT",
      isRequired: false,
      options: null,
    });
    const fieldId = services.rows[0]?.fields[0]?.id;
    if (!fieldId) throw new Error("fixture");
    expect(await removeBookingField(services, bookingContext, serviceId, fieldId)).toEqual({
      ok: true,
    });
    expect(services.rows[0]?.fields).toHaveLength(0);
  });
});
