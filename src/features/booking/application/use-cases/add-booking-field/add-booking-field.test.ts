import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { addBookingField } from "./add-booking-field";

describe("addBookingField", () => {
  it("AC-CAT-014 derives stable keys and AC-CAT-015 validates SELECT options", async () => {
    const { services, serviceId } = await serviceFixture();
    expect(
      await addBookingField(services, bookingContext, serviceId, "user", {
        name: "Nama kampus",
        fieldType: "TEXT",
        isRequired: true,
        options: null,
      }),
    ).toEqual({ ok: true });
    expect(
      await addBookingField(services, bookingContext, serviceId, "user", {
        name: "Ukuran toga",
        fieldType: "SELECT",
        isRequired: false,
        options: ["S", "M", "L"],
      }),
    ).toEqual({ ok: true });
    expect(services.rows[0]?.fields.map(({ key }) => key)).toEqual(["nama_kampus", "ukuran_toga"]);
    expect(
      await addBookingField(services, bookingContext, serviceId, "user", {
        name: "Pilihan",
        fieldType: "SELECT",
        isRequired: false,
        options: [],
      }),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { options: "OPTIONS_REQUIRED" },
    });
    expect(
      await addBookingField(services, bookingContext, serviceId, "user", {
        name: "Pilihan",
        fieldType: "SELECT",
        isRequired: false,
        options: ["S", "M", "s"],
      }),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { "options.2": "OPTION_DUPLICATE" },
    });
  });
});
