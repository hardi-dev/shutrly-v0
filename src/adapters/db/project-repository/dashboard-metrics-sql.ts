import "server-only";

import { type SQL, sql } from "drizzle-orm";

import { REVIEW_WAITING_DAYS } from "@/features/booking/domain/dashboard-metrics/dashboard-metrics";
import type { MetricWindows } from "@/features/booking/domain/dashboard-metrics/dashboard-metrics.types";
import { PROJECT_SCHEDULE_TIME_ZONE } from "@/features/booking/domain/schedule-clock/schedule-clock";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

// Jakarta midnight of a schedule day, as a timestamp (D-4). Every window is built from these.
const startOf = (day: string): SQL =>
  sql`((${day}::date)::timestamp at time zone ${PROJECT_SCHEDULE_TIME_ZONE})`;

// The Jakarta month of a timestamp column, as YYYY-MM, for the sparkline series (D-6).
const monthOf = (column: string): SQL =>
  sql`to_char(${sql.raw(column)} at time zone ${PROJECT_SCHEDULE_TIME_ZONE}, 'YYYY-MM')`;

/** Builds one statement of scalar subqueries and two monthly series, each scoped to the workspace and cut at `now` (D-3, D-4, D-6, D-7). @param context - verified workspace @param windows - the windows from metricWindows @returns the SQL */
export function buildDashboardMetricsSql(context: WorkspaceContext, windows: MetricWindows): SQL {
  const ws = context.workspaceId;
  const now = sql`${windows.now.toISOString()}::timestamptz`;
  const monthFrom = startOf(windows.monthStart);
  const prevFrom = startOf(windows.prevMonthStart);
  const prevTo = startOf(windows.prevEnd);
  const sparkFrom = startOf(windows.sparkStart);
  const waitingBefore = sql`${now} - make_interval(days => ${REVIEW_WAITING_DAYS}::int)`;
  const reviewable = sql`sg.workspace_id = ${ws} and p.status <> 'CANCELLED'
    and (sg.status = 'SUBMITTED' or (sg.status = 'OPEN' and sg.submitted_at is not null))`;

  return sql`select
    (select count(*)::int from project p
      where p.workspace_id = ${ws} and p.created_at >= ${monthFrom} and p.created_at <= ${now}) as new_this_month,
    (select count(*)::int from project p
      where p.workspace_id = ${ws} and p.created_at >= ${prevFrom} and p.created_at < ${prevTo}) as new_prev,
    (select count(*)::int from selection_group sg join project p on p.id = sg.project_id and p.workspace_id = sg.workspace_id
      where ${reviewable}) as to_review,
    (select count(*)::int from selection_group sg join project p on p.id = sg.project_id and p.workspace_id = sg.workspace_id
      where ${reviewable} and sg.submitted_at <= ${waitingBefore}) as to_review_waiting,
    (select count(*)::int from project p
      where p.workspace_id = ${ws} and p.status = 'POST_PROCESSING') as in_editing,
    (select count(*)::int from project p
      where p.workspace_id = ${ws} and p.status = 'POST_PROCESSING'
        and not exists (select 1 from selection_group g
          where g.workspace_id = p.workspace_id and g.project_id = p.id and g.status <> 'LOCKED')) as in_editing_ready,
    (select count(*)::int from gallery g join project p on p.id = g.project_id and p.workspace_id = g.workspace_id
      where g.workspace_id = ${ws} and p.status <> 'CANCELLED'
        and g.final_delivery_published_at >= ${monthFrom} and g.final_delivery_published_at <= ${now}) as delivered_this_month,
    (select count(*)::int from gallery g join project p on p.id = g.project_id and p.workspace_id = g.workspace_id
      where g.workspace_id = ${ws} and p.status <> 'CANCELLED'
        and g.final_delivery_published_at >= ${prevFrom} and g.final_delivery_published_at < ${prevTo}) as delivered_prev,
    (select coalesce(json_agg(json_build_object('month', m.month, 'count', m.count)), '[]'::json) from (
      select ${monthOf("p.created_at")} as month, count(*)::int as count from project p
      where p.workspace_id = ${ws} and p.created_at >= ${sparkFrom} and p.created_at <= ${now}
      group by 1) m) as new_by_month,
    (select coalesce(json_agg(json_build_object('month', m.month, 'count', m.count)), '[]'::json) from (
      select ${monthOf("g.final_delivery_published_at")} as month, count(*)::int as count
      from gallery g join project p on p.id = g.project_id and p.workspace_id = g.workspace_id
      where g.workspace_id = ${ws} and p.status <> 'CANCELLED'
        and g.final_delivery_published_at >= ${sparkFrom} and g.final_delivery_published_at <= ${now}
      group by 1) m) as delivered_by_month`;
}
