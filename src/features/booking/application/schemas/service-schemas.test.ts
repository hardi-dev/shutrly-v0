import { describe, expect, it } from "vitest";

import { bookingFieldSchema } from "./booking-field/booking-field.schema";
import { createServiceInfoSchema } from "./service-info/service-info.schema";

describe("service schemas", () => {
  it("AC-CAT-010 canonicalises an IDR amount", () => {
    expect(
      createServiceInfoSchema("id-ID").parse({
        name: "Wisuda Basic",
        categoryId: "00000000-0000-4000-8000-000000000001",
        basePrice: "750.000",
      }).basePrice,
    ).toBe("750000");
  });

  it("AC-CAT-015 reports SELECT option problems by indexed path", () => {
    const result = bookingFieldSchema.safeParse({
      name: "Ukuran",
      fieldType: "SELECT",
      isRequired: false,
      options: ["S", "M", "s"],
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]).toMatchObject({
        path: ["options", 2],
        message: "OPTION_DUPLICATE",
      });
  });
});
