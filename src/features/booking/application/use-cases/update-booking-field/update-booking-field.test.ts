import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { addBookingField } from "../add-booking-field/add-booking-field";
import { updateBookingField } from "./update-booking-field";

describe("updateBookingField", () => {
  it("AC-CAT-014 keeps the generated key when renaming", async () => {
    const { services, serviceId } = await serviceFixture();
    await addBookingField(services, bookingContext, serviceId, "user", {
      name: "Nama kampus",
      fieldType: "TEXT",
      isRequired: false,
      options: null,
    });
    const fieldId = services.rows[0]?.fields[0]?.id;
    if (!fieldId) throw new Error("fixture");
    expect(
      await updateBookingField(services, bookingContext, serviceId, fieldId, "user", {
        name: "Nama universitas",
        fieldType: "TEXT",
        isRequired: true,
        options: null,
      }),
    ).toEqual({ ok: true });
    expect(services.rows[0]?.fields[0]).toMatchObject({
      key: "nama_kampus",
      name: "Nama universitas",
      isRequired: true,
    });
  });
});
