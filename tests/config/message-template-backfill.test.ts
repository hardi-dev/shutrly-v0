import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";
import { TEMPLATE_TYPES } from "@/features/communications/domain/template-type/template-type";

const sql = readFileSync(
  new URL("../../drizzle/0003_message_template_backfill.sql", import.meta.url),
  "utf8",
);

describe("message template backfill migration", () => {
  it.each(TEMPLATE_TYPES)("AC-MSG-002 backfills the %s default verbatim", (type) => {
    expect(sql).toContain(`('${type}', $$${DEFAULT_TEMPLATE_CONTENT[type]}$$)`);
  });

  it("AC-MSG-002 is idempotent", () => {
    expect(sql).toContain('ON CONFLICT ("workspace_id", "type", "channel") DO NOTHING');
  });
});
