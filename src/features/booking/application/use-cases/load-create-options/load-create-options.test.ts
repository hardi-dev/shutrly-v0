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

  it("AC-PRJ-014 reports whether any service is active", async () => {
    const options = await loadCreateOptions(projectFixture(), projectContext);
    expect(options.hasActiveService).toBe(true);
    const repository = projectFixture();
    repository.services.splice(
      0,
      repository.services.length,
      ...repository.services.map((service) => ({ ...service, isActive: false })),
    );
    expect((await loadCreateOptions(repository, projectContext)).hasActiveService).toBe(false);
  });

  it("AC-PRJ-030 returns the active item definitions for Tambah item", async () => {
    const options = await loadCreateOptions(projectFixture(), projectContext);
    expect(options.definitions.map((definition) => definition.name)).toEqual([
      "Foto edit",
      "Jumlah orang",
      "Foto cetak",
    ]);
  });
});
