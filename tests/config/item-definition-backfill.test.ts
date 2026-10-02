import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DEFAULT_ITEM_DEFINITIONS } from "@/features/booking/domain/default-item-definitions/default-item-definitions";

const dir = new URL("../../drizzle/", import.meta.url);
const file = readdirSync(dir).find((name) => name.endsWith("_item_definition_backfill.sql"));
const sql = readFileSync(new URL(file ?? "missing.sql", dir), "utf8");

describe("item definition backfill migration", () => {
  it("AC-CAT-002 BR-CAT-011 contains every default definition", () => {
    for (const definition of DEFAULT_ITEM_DEFINITIONS) {
      const unit = definition.unit === null ? "NULL" : `'${definition.unit}'`;
      const selectionType =
        definition.selectionType === null ? "NULL" : `'${definition.selectionType}'`;
      expect(sql).toContain(
        `('${definition.name}','${definition.valueType}',${unit},${String(definition.selectionRequired)},${selectionType})`,
      );
    }
  });

  it("AC-CAT-002 is idempotent", () => {
    expect(sql).toContain("WHERE NOT EXISTS");
    expect(sql).toContain('lower(s."name") = lower(d.name)');
    expect(sql).toContain("ON CONFLICT DO NOTHING");
  });
});
