import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import { getServiceDetail } from "./get-service-detail";

describe("getServiceDetail", () => {
  it("AC-CAT-010/011/014 returns detail, items and fields", async () => {
    const { services, serviceId } = await serviceFixture();
    expect(await getServiceDetail(services, bookingContext, serviceId, "id-ID")).toMatchObject({
      name: "Wisuda Basic",
      basePrice: "750000",
      categoryName: "Wisuda",
      currency: "IDR",
      fields: [],
    });
  });

  it("throws NOT_FOUND for an unknown service", async () => {
    await expect(
      getServiceDetail((await serviceFixture()).services, bookingContext, "missing", "id-ID"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" } satisfies Partial<CatalogError>);
  });
});
