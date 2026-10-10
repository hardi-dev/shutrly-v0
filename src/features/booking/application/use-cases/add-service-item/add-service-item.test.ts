import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { addServiceItem } from "./add-service-item";

describe("addServiceItem", () => {
  it("AC-CAT-011 adds number and range values", async () => {
    const { services, definitions, serviceId } = await serviceFixture();
    const editId = definitions.rows[0]?.id;
    const peopleId = definitions.rows[2]?.id;
    if (!editId || !peopleId) throw new Error("fixture");
    expect(
      await addServiceItem(
        services,
        definitions,
        bookingContext,
        serviceId,
        editId,
        "user",
        {
          type: "NUMBER",
          value: "25",
        },
        "id-ID",
      ),
    ).toEqual({ ok: true });
    expect(
      await addServiceItem(
        services,
        definitions,
        bookingContext,
        serviceId,
        peopleId,
        "user",
        {
          type: "RANGE",
          min: "1",
          max: "2",
        },
        "id-ID",
      ),
    ).toEqual({ ok: true });
    expect(services.rows[0]?.items.map(({ value }) => value)).toEqual([
      { type: "NUMBER", value: "25" },
      { type: "RANGE", min: "1", max: "2" },
    ]);
  });

  it("AC-CAT-012/013 maps value and duplicate errors", async () => {
    const { services, definitions, serviceId } = await serviceFixture();
    const editId = definitions.rows[0]?.id;
    if (!editId) throw new Error("fixture");
    expect(
      await addServiceItem(
        services,
        definitions,
        bookingContext,
        serviceId,
        editId,
        "user",
        {
          type: "NUMBER",
          value: "2.5",
        },
        "id-ID",
      ),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { value: "INVALID" },
    });
    await addServiceItem(
      services,
      definitions,
      bookingContext,
      serviceId,
      editId,
      "user",
      {
        type: "NUMBER",
        value: "2",
      },
      "id-ID",
    );
    expect(
      await addServiceItem(
        services,
        definitions,
        bookingContext,
        serviceId,
        editId,
        "user",
        {
          type: "NUMBER",
          value: "3",
        },
        "id-ID",
      ),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { definitionId: "DUPLICATE_DEFINITION" },
    });
    expect(
      await addServiceItem(
        services,
        definitions,
        bookingContext,
        serviceId,
        editId,
        "user",
        {
          type: "NUMBER",
          value: "-1",
        },
        "id-ID",
      ),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { value: "NEGATIVE" },
    });
  });

  it("AC-CAT-012/017 guards unordered ranges and archived definitions", async () => {
    const { services, definitions, serviceId } = await serviceFixture();
    const peopleId = definitions.rows[2]?.id;
    const editId = definitions.rows[0]?.id;
    if (!peopleId || !editId) throw new Error("fixture");
    expect(
      await addServiceItem(
        services,
        definitions,
        bookingContext,
        serviceId,
        peopleId,
        "user",
        {
          type: "RANGE",
          min: "3",
          max: "2",
        },
        "id-ID",
      ),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { max: "MIN_GREATER_THAN_MAX" },
    });
    definitions.rows[0] = { ...definitions.rows[0], isActive: false };
    expect(
      await addServiceItem(
        services,
        definitions,
        bookingContext,
        serviceId,
        editId,
        "user",
        {
          type: "NUMBER",
          value: "2",
        },
        "id-ID",
      ),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { definitionId: "INACTIVE_REFERENCE" },
    });
  });
});
