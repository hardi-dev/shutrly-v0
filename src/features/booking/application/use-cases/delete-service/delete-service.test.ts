import { describe, expect, it } from "vitest";

import {
  bookingContext,
  serviceFixture,
} from "../../../../../../tests/support/booking/service-fixtures";
import { deleteService } from "./delete-service";

describe("deleteService", () => {
  it("AC-CAT-018 guards services used by projects", async () => {
    const { services, serviceId } = await serviceFixture();
    services.projectsByService.add(serviceId);
    expect(await deleteService(services, bookingContext, serviceId)).toEqual({
      ok: false,
      code: "IN_USE",
    });
    services.projectsByService.delete(serviceId);
    expect(await deleteService(services, bookingContext, serviceId)).toEqual({ ok: true });
  });
});
