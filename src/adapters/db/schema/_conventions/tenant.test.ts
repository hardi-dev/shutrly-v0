import { generateDrizzleJson, generateMigration } from "drizzle-kit/api";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { auditColumns, idColumn, tenantKey, tenantRef, workspaceIdColumn } from "./tenant";

const fixtureParent = pgTable(
  "fixture_parent",
  { id: idColumn(), workspaceId: workspaceIdColumn(), ...auditColumns() },
  (t) => [tenantKey(t)],
);

const fixtureChild = pgTable(
  "fixture_child",
  { id: idColumn(), workspaceId: workspaceIdColumn(), parentId: uuid("parent_id").notNull() },
  (t) => [
    tenantKey(t),
    tenantRef({ workspaceId: t.workspaceId, column: t.parentId }, fixtureParent),
  ],
);

describe("tenant conventions", () => {
  it("AC-FND-007 generates workspace_id, unique (workspace_id, id) and the composite FK", async () => {
    const statements = await generateMigration(
      generateDrizzleJson({}),
      generateDrizzleJson({ fixtureParent, fixtureChild }),
    );
    const sql = statements.join("\n");
    expect(sql).toContain('"workspace_id" uuid NOT NULL');
    expect(sql).toMatch(/"id" uuid PRIMARY KEY DEFAULT gen_random_uuid\(\)/);
    expect(sql).toMatch(/UNIQUE\s*\("workspace_id",\s*"id"\)/);
    expect(sql).toMatch(
      /FOREIGN KEY \("workspace_id",\s*"parent_id"\) REFERENCES "(public"\.)?"?fixture_parent"?\("workspace_id",\s*"id"\)/,
    );
    expect(sql).toContain('"created_at" timestamp with time zone DEFAULT now() NOT NULL');
    expect(sql).toContain('"updated_at" timestamp with time zone DEFAULT now() NOT NULL');
  });
});
