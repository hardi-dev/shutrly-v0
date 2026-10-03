import "server-only";

import { type SQL, sql } from "drizzle-orm";

import type { ProjectListReadQuery } from "@/features/booking/application/ports/project-list-reader/project-list-reader.port";
import { tabStatuses } from "@/features/booking/domain/project-status/project-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { shownSessionJoin } from "./shown-session-sql";

const LIKE_SPECIAL = /[\\%_]/g;

/** Escapes LIKE wildcards so `%` and `_` search as text. @param text - the search @returns the escaped text */
export function escapeLike(text: string): string {
  return text.replace(LIKE_SPECIAL, (character) => `\\${character}`);
}

function statusList(tab: ProjectListReadQuery["tab"]): SQL {
  return sql.join(
    tabStatuses(tab).map((status) => sql`${status}`),
    sql`, `,
  );
}

function baseCte(context: WorkspaceContext, query: ProjectListReadQuery): SQL {
  const pattern = query.search === null ? "" : "%" + escapeLike(query.search) + "%";
  const search =
    query.search === null
      ? sql``
      : sql`and (p.title ilike ${pattern} escape '\\' or c.name ilike ${pattern} escape '\\')`;
  return sql`
    with base as (
      select p.id, p.title, p.status, p.created_at, p.client_id, c.name as client_name,
             c.whatsapp_number as client_whatsapp, s.name as service_name,
             shown.id as s_id, shown.name as s_name, shown.session_date as s_date,
             shown.start_time as s_start, shown.end_time as s_end, shown.location as s_location,
             shown.created_at as s_created,
             (select count(*) from project_session x where x.project_id = p.id)::int as session_count
      from project p
      join client c on c.workspace_id = p.workspace_id and c.id = p.client_id
      join service s on s.workspace_id = p.workspace_id and s.id = p.service_id
      ${shownSessionJoin(query.today)}
      where p.workspace_id = ${context.workspaceId} and p.status in (${statusList(query.tab)})
      ${search}
    )`;
}

function cursorPredicate(afterId: string, isAscending: boolean): SQL {
  const compare = isAscending ? sql`>` : sql`<`;
  return sql`where exists (select 1 from base cur where cur.id = ${afterId}) and (
    ((base.s_date is null)::int > (select (cur.s_date is null)::int from base cur where cur.id = ${afterId}))
    or ((base.s_date is null) = (select (cur.s_date is null) from base cur where cur.id = ${afterId}) and (
      (base.s_date is not null and base.s_date ${compare} (select cur.s_date from base cur where cur.id = ${afterId}))
      or (base.s_date is not distinct from (select cur.s_date from base cur where cur.id = ${afterId}) and (
        base.created_at < (select cur.created_at from base cur where cur.id = ${afterId})
        or (base.created_at = (select cur.created_at from base cur where cur.id = ${afterId}) and base.id > ${afterId}::uuid)))))
  )`;
}

/** Builds the list query: tab statuses, optional search, session-date order and a keyset cursor (D-8). @param context - verified workspace @param query - tab, search, cursor, limit and today @returns the SQL */
export function buildProjectListSql(context: WorkspaceContext, query: ProjectListReadQuery): SQL {
  const isAscending = query.tab === "ACTIVE";
  const direction = isAscending ? sql`asc` : sql`desc`;
  const cursor = query.afterId === null ? sql`` : cursorPredicate(query.afterId, isAscending);
  return sql`${baseCte(context, query)}
    select * from base ${cursor}
    order by (s_date is null), s_date ${direction}, created_at desc, id
    limit ${query.limit}`;
}
