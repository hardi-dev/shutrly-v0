import { describe, expect, it } from "vitest";

import {
  projectContext,
  projectFixture,
} from "../../../../../../tests/support/booking/project-fixtures";
import { loadCreateOptions } from "./load-create-options";

describe("load create options (AC-PRJ-006)", () => {
  it("lists active services grouped by category and leaves out archived ones", async () => {
    const options = await loadCreateOptions(projectFixture(), projectContext);
    expect(options.serviceGroups).toHaveLength(1);
    expect(options.serviceGroups[0]?.categoryName).toBe("Wisuda");
    expect(options.serviceGroups[0]?.services.map((service) => service.name)).toEqual([
      "Wisuda Basic",
    ]);
  });
});
