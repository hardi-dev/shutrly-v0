import { describe, expect, it } from "vitest";

import {
  projectContext,
  projectFixture,
} from "../../../../../../tests/support/booking/project-fixtures";
import { searchActiveClients } from "./search-active-clients";

describe("search active clients (AC-PRJ-006)", () => {
  it("returns active clients by name and never an archived one", async () => {
    const repository = projectFixture();
    const all = await searchActiveClients(repository, projectContext, "  ");
    expect(all.map((client) => client.name)).toEqual(["Rina", "Sari"]);
    const matches = await searchActiveClients(repository, projectContext, " rin ");
    expect(matches.map((client) => client.name)).toEqual(["Rina"]);
    expect(await searchActiveClients(repository, projectContext, "Budi")).toEqual([]);
  });

  it("limits the picker to eight clients", async () => {
    const repository = projectFixture();
    for (let index = 0; index < 12; index += 1) {
      repository.clients.push({
        id: `extra-${String(index)}`,
        name: `Extra ${String(index).padStart(2, "0")}`,
        whatsappNumber: null,
        isArchived: false,
      });
    }
    expect(await searchActiveClients(repository, projectContext, "")).toHaveLength(8);
  });
});
