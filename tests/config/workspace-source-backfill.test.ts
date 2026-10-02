import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DEFAULT_SOURCE } from "@/features/gallery/domain/default-source/default-source";

const dir = new URL("../../drizzle/", import.meta.url);
const file = readdirSync(dir).find((name) =>
  name.endsWith("_workspace_source_config_backfill.sql"),
);
const sql = readFileSync(new URL(file ?? "missing.sql", dir), "utf8");

describe("workspace source backfill migration", () => {
  it("AC-SRC-002 BR-SRC-005 seeds the default Google Drive source", () => {
    expect(sql).toContain(`'${DEFAULT_SOURCE.provider}', '${DEFAULT_SOURCE.displayName}'`);
  });

  it("AC-SRC-002 is idempotent", () => {
    expect(sql).toContain("WHERE NOT EXISTS");
    expect(sql).toContain("ON CONFLICT DO NOTHING");
  });
});
