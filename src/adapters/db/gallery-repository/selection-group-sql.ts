import "server-only";

import { sql } from "drizzle-orm";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { projectItem } from "../schema/booking/project";
import { gallery } from "../schema/gallery/gallery";
import { selectionGroup } from "../schema/gallery/selection";

/**
 * The group's base limit from a snapshotted NUMBER item; selection items hold whole numbers
 * (BR-CAT-007), so a stray fraction is floored rather than rejected.
 */
export const itemLimitSql = sql<number>`case when ${projectItem.value}->>'type' = 'NUMBER' then floor((${projectItem.value}->>'value')::numeric)::int else 0 end`;

/**
 * Inserts one OPEN group per selection item of the gallery's project that has none yet
 * (D-10a, A-23). Reads the project's items directly, like the other gallery reads (D-14).
 * @param tx - the transaction holding the gallery lock
 * @param context - verified workspace
 * @param galleryId - the locked gallery
 * @returns how many groups were created
 */
export async function insertSelectionGroups(
  tx: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
): Promise<number> {
  const result = await tx.execute(sql`
    insert into ${selectionGroup} (workspace_id, project_id, project_item_id, gallery_id, base_limit)
    select ${projectItem.workspaceId}, ${projectItem.projectId}, ${projectItem.id}, ${gallery.id}, ${itemLimitSql}
    from ${projectItem}
    join ${gallery} on ${gallery.workspaceId} = ${projectItem.workspaceId}
      and ${gallery.projectId} = ${projectItem.projectId}
    where ${gallery.workspaceId} = ${context.workspaceId}
      and ${gallery.id} = ${galleryId}
      and ${projectItem.selectionRequired}
    on conflict (project_item_id) do nothing`);
  return result.rowCount ?? 0;
}
