import "server-only";

import { sql } from "drizzle-orm";

import type { SetupFactsReaderPort } from "@/features/workspace/application/ports/setup-facts-reader/setup-facts-reader.port";

import type { DbExecutor } from "../client/client.types";
import { setupFactsRowSchema } from "./drizzle-setup-facts-reader.schema";

// One statement of scalar subqueries, every one scoped to the workspace (C-101, ADR-018, F-25 D-2).
function setupFactsSql(workspaceId: string) {
  return sql`select
    exists(select 1 from project p where p.workspace_id = ${workspaceId}) as has_project,
    (select count(*)::int from (
      select 1 from service s where s.workspace_id = ${workspaceId} and s.is_active limit 2
    ) capped) as active_service_count,
    (select s.id::text from service s
      where s.workspace_id = ${workspaceId} and s.is_active
      order by s.id limit 1) as first_active_service_id,
    exists(select 1 from service s
      join service_item si on si.workspace_id = s.workspace_id and si.service_id = s.id
      join service_item_definition d on d.workspace_id = si.workspace_id and d.id = si.definition_id
      where s.workspace_id = ${workspaceId} and s.is_active and d.selection_required
    ) as has_selection_item,
    exists(select 1 from workspace w
      where w.id = ${workspaceId} and coalesce(btrim(w.brand_name), '') <> ''
    ) as has_brand_name`;
}

/** Creates the setup-facts reader: one round trip per dashboard load (F-25 D-2). @param db - the request-scoped Drizzle database @returns the reader */
export function createDrizzleSetupFactsReader(db: DbExecutor): SetupFactsReaderPort {
  return {
    async read(context) {
      const result = await db.execute(setupFactsSql(context.workspaceId));
      const row = setupFactsRowSchema.parse(result.rows.at(0));
      return {
        hasProject: row.has_project,
        activeServiceCount: row.active_service_count,
        soleActiveServiceId: row.active_service_count === 1 ? row.first_active_service_id : null,
        hasSelectionItem: row.has_selection_item,
        hasBrandName: row.has_brand_name,
      };
    },
  };
}
