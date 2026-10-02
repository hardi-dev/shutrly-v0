import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { addBookingField } from "../add-booking-field/add-booking-field";
import { moveBookingField } from "./move-booking-field";

describe("moveBookingField", () => {
  it("AC-CAT-016 reorders booking fields", async () => {
    const { services, serviceId } = await serviceFixture();
    await addBookingField(services, bookingContext, serviceId, "user", {
      name: "Nama",
      fieldType: "TEXT",
      isRequired: false,
      options: null,
    });
    await addBookingField(services, bookingContext, serviceId, "user", {
      name: "Tanggal",
      fieldType: "DATE",
      isRequired: false,
      options: null,
    });
    const firstId = services.rows[0]?.fields[0]?.id;
    const secondId = services.rows[0]?.fields[1]?.id;
    if (!firstId || !secondId) throw new Error("fixture");
    expect(await moveBookingField(services, bookingContext, serviceId, secondId, "UP")).toEqual({
      ok: true,
    });
    expect(services.rows[0]?.fields.map(({ id }) => id)).toEqual([secondId, firstId]);
  });
});
