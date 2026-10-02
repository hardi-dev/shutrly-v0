import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { listServices } from "./list-services";

describe("listServices", () => {
  it("AC-CAT-005 groups services by category with formatted price and item summary", async () => {
    const { services, categories } = await serviceFixture();
    const result = await listServices(services, categories, bookingContext);
    expect(result[0]?.services[0]).toMatchObject({
      name: "Wisuda Basic",
      priceLabel: "Rp 750.000",
      summary: "",
    });
  });
});
