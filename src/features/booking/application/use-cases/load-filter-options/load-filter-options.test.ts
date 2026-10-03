import { describe, expect, it } from "vitest";

import {
  projectContext,
  projectFixture,
} from "../../../../../../tests/support/booking/project-fixtures";
import { loadFilterServices, searchFilterClients } from "./load-filter-options";

describe("load filter options", () => {
  it("AC-PRJ-028 lists archived services too", async () => {
    const services = await loadFilterServices(projectFixture(), projectContext);
    expect(services.map((service) => [service.name, service.isActive])).toEqual([
      ["Prewed Lama", false],
      ["Wisuda Basic", true],
    ]);
  });

  it("AC-PRJ-028 finds archived clients and ignores non-text queries", async () => {
    const clients = await searchFilterClients(projectFixture(), projectContext, "bud");
    expect(clients).toEqual([expect.objectContaining({ name: "Budi", isArchived: true })]);
    expect(await searchFilterClients(projectFixture(), projectContext, 42)).toHaveLength(3);
  });
});
