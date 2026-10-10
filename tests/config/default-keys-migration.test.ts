import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

// D-18 / §4.4: the 0021 backfill flags exactly the untouched seed rows of 0007 and 0011.
const sql = readFileSync(
  new URL("../../drizzle/0021_default_item_keys.sql", import.meta.url),
  "utf8",
);
const seed0007 = readFileSync(
  new URL("../../drizzle/0007_item_definition_backfill.sql", import.meta.url),
  "utf8",
);
const seed0011 = readFileSync(
  new URL("../../drizzle/0011_team_role_backfill.sql", import.meta.url),
  "utf8",
);

describe("default keys migration", () => {
  it.each([
    ["('Foto edit','foto','EDITED_PHOTOS')", "('Foto edit','NUMBER','foto',true,'EDIT')"],
    ["('Foto cetak','lembar','PRINTED_PHOTOS')", "('Foto cetak','NUMBER','lembar',true,'PRINT')"],
    ["('Jumlah orang','orang','PEOPLE_COUNT')", "('Jumlah orang','RANGE','orang',false,NULL)"],
    [
      "('Durasi pemotretan','jam','SHOOT_DURATION')",
      "('Durasi pemotretan','NUMBER','jam',false,NULL)",
    ],
  ])("D-18 %s maps a 0007 seed row", (mapping, seedRow) => {
    expect(sql).toContain(mapping);
    expect(seed0007).toContain(seedRow);
  });

  it.each([
    ["('Fotografer','PHOTOGRAPHER')", "('Fotografer')"],
    ["('Videografer','VIDEOGRAPHER')", "('Videografer')"],
    ["('Asisten','ASSISTANT')", "('Asisten')"],
  ])("D-18 %s maps a 0011 seed role", (mapping, seedRole) => {
    expect(sql).toContain(mapping);
    expect(seed0011).toContain(seedRole);
  });

  it("D-18 the backfill never edits historical migrations and keeps renames unkeyed", () => {
    expect(sql).toContain('IS NOT DISTINCT FROM m."unit"');
    expect(sql).not.toMatch(/UPDATE "service_item_definition" SET "name"/);
  });
});
