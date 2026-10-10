import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const dir = new URL("../../drizzle/", import.meta.url);

/** The (type, text) pairs of a file's dollar-quoted default literals, in file order. */
function literalPairs(sql: string): readonly (readonly [string, string])[] {
  return [...sql.matchAll(/\('([A-Z_]+)', \$\$([\s\S]*?)\$\$\)/g)].map(
    (match) => [match[1], match[2]] as const,
  );
}

function migration(suffix: string): string {
  const file = readdirSync(dir).find((name) => name.endsWith(suffix));
  return readFileSync(new URL(file ?? "missing.sql", dir), "utf8");
}

describe("message template default flag migration", () => {
  it("BR-L10N-003 flags exactly the five historical 0003 defaults, byte for byte", () => {
    const historical = literalPairs(migration("_message_template_backfill.sql"));
    const flagged = literalPairs(migration("_default_template_flag.sql"));
    expect(historical).toHaveLength(5);
    expect(flagged).toEqual(historical);
  });

  it("BR-L10N-005 never rewrites content", () => {
    expect(migration("_default_template_flag.sql")).not.toMatch(/SET\s+"content"/);
  });
});
