import { describe, expect, it } from "vitest";

import { sortCatalogEntries } from "./catalog-order";

describe("catalog order (AC-CAT-005)", () => {
  it("sorts active entries by name before archived entries", () => {
    const entries = [
      { name: "Wisuda Lama", isActive: false },
      { name: "Wisuda Plus", isActive: true },
      { name: "Wisuda Basic", isActive: true },
    ];

    expect(sortCatalogEntries(entries).map(({ name }) => name)).toEqual([
      "Wisuda Basic",
      "Wisuda Plus",
      "Wisuda Lama",
    ]);
  });
});
