import { describe, expect, it } from "vitest";

import {
  bookingContext,
  categoryId,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { updateServiceInfo } from "./update-service-info";

describe("updateServiceInfo", () => {
  it("AC-CAT-020 changes only the service info", async () => {
    const { services, serviceId } = await serviceFixture();
    expect(
      await updateServiceInfo(
        services,
        bookingContext,
        serviceId,
        "user",
        {
          name: "Wisuda Baru",
          categoryId,
          basePrice: "12.000.000",
        },
        "id-ID",
      ),
    ).toEqual({ ok: true });
    expect(services.rows[0]).toMatchObject({ name: "Wisuda Baru", basePrice: "12000000" });
    expect(services.rows[0]?.items).toHaveLength(0);
  });
});
