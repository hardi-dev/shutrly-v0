import "server-only";

import { type SQL, sql } from "drizzle-orm";

import type { ActiveProjectsQuery } from "@/features/booking/application/ports/dashboard-overview-reader/dashboard-overview-reader.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { filterPredicates, searchPredicate, statusList } from "./project-list-sql";

/** The project's next session: the earliest from `today` on, untimed first. Unlike the list's shown session it never falls back to a past one (AC-DASH-027, D-8). Joined as `nxt`. */
function nextSessionJoin(today: string): SQL {
  return sql`
    left join lateral (
      select ps.* from project_session ps
      where ps.project_id = p.id and ps.session_date >= ${today}::date
      order by ps.session_date, ps.start_time nulls first, ps.created_at limit 1
    ) nxt on true`;
}

/** Builds the dashboard's active-projects page: active statuses, the list's search and filter, the next-session order, and the total before the limit (AC-DASH-026, 036, 037, D-8). @param context - verified workspace @param query - search, filter, today and the row limit @returns the SQL */
export function buildDashboardProjectsSql(
  context: WorkspaceContext,
  query: ActiveProjectsQuery,
): SQL {
  return sql`
    with base as (
      select p.id, p.title, p.status, p.created_at, p.client_id, p.agreed_price,
             c.name as client_name, c.whatsapp_number as client_whatsapp, s.name as service_name,
             nxt.id as s_id, nxt.name as s_name, nxt.session_date as s_date,
             nxt.start_time as s_start, nxt.end_time as s_end, nxt.location as s_location,
             nxt.created_at as s_created,
             (select count(*) from project_session x where x.project_id = p.id)::int as session_count,
             exists (select 1 from session_assignment a
               where a.workspace_id = p.workspace_id and a.project_id = p.id) as has_team
      from project p
      join client c on c.workspace_id = p.workspace_id and c.id = p.client_id
      join service s on s.workspace_id = p.workspace_id and s.id = p.service_id
      ${nextSessionJoin(query.today)}
      where p.workspace_id = ${context.workspaceId} and p.status in (${statusList("ACTIVE")})
      ${searchPredicate(query.search)}
      ${filterPredicates(query.filter)}
    )
    select base.*, (count(*) over ())::int as total from base
    order by (s_date is null), s_date, s_start nulls first, s_created, created_at, id
    limit ${query.limit}`;
}
