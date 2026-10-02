import { describe, expect, it } from "vitest";

import {
  bookingContext,
  categoryId,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { addService } from "./add-service";

describe("addService", () => {
  it("AC-CAT-010 creates a service with canonical IDR", async () => {
    const { services } = await serviceFixture();
    const result = await addService(services, bookingContext, "user", {
      name: "Wisuda Plus",
      categoryId,
      basePrice: "750.000",
    });
    expect(result).toMatchObject({ ok: true });
    expect(services.rows.find((row) => row.name === "Wisuda Plus")?.basePrice).toBe("750000");
  });

  it("AC-CAT-019 rejects duplicates and inactive categories", async () => {
    const { services, categories } = await serviceFixture();
    expect(
      await addService(services, bookingContext, "user", {
        name: "wisuda basic",
        categoryId,
        basePrice: "1",
      }),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { name: "NAME_TAKEN" },
    });
    categories.rows[0] = { ...categories.rows[0], isActive: false };
    expect(
      await addService(services, bookingContext, "user", {
        name: "Arsip",
        categoryId,
        basePrice: "1",
      }),
    ).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { categoryId: "INACTIVE_REFERENCE" },
    });
  });
});
