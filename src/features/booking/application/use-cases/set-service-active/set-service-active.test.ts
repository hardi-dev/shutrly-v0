import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { setServiceActive } from "./set-service-active";

describe("setServiceActive", () => {
  it("AC-CAT-017 archives and restores a service", async () => {
    const { services, serviceId } = await serviceFixture();
    await setServiceActive(services, bookingContext, serviceId, "user", false);
    expect(services.rows[0]?.isActive).toBe(false);
    await setServiceActive(services, bookingContext, serviceId, "user", true);
    expect(services.rows[0]?.isActive).toBe(true);
  });
});
