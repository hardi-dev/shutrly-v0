import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { listServices } from "./list-services";

describe("listServices", () => {
  it("AC-CAT-005 groups services by category with formatted price and item summary", async () => {
    const { services, categories } = await serviceFixture();
    const result = await listServices(services, categories, bookingContext, "id-ID");
    expect(result[0]?.services[0]).toMatchObject({
      name: "Wisuda Basic",
      priceLabel: "Rp 750.000",
      summary: "",
    });
  });

  it("keeps the category archive status on each service group", async () => {
    const { categories, services } = await serviceFixture();
    categories.rows[0] = { ...categories.rows[0], isActive: false };

    const result = await listServices(services, categories, bookingContext, "id-ID");

    expect(result[0]).toMatchObject({ categoryName: "Wisuda", isActive: false });
  });

  it("keeps archived category sections after active sections", async () => {
    const { categories, services } = await serviceFixture();
    const activeCategory = await categories.create(bookingContext, "Wedding", "user");
    if (activeCategory.status !== "CREATED") throw new Error("fixture");
    categories.rows[0] = { ...categories.rows[0], isActive: false };

    const result = await listServices(services, categories, bookingContext, "id-ID");

    expect(result.map(({ categoryName }) => categoryName)).toEqual(["Wedding", "Wisuda"]);
  });
});
