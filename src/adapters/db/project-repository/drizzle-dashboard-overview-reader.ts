import "server-only";

import type { DashboardOverviewReaderPort } from "@/features/booking/application/ports/dashboard-overview-reader/dashboard-overview-reader.port";
import { canonicalIdrAmount } from "@/features/booking/domain/idr-amount/idr-amount";

import type { DbExecutor } from "../client/client.types";
import { buildDashboardMetricsSql } from "./dashboard-metrics-sql";
import { buildDashboardProjectsSql } from "./dashboard-projects-sql";
import { dashboardMetricsRowSchema } from "./drizzle-dashboard-overview-reader.schema";
import { toRow } from "./drizzle-project-list-reader";

/** Builds the dashboard overview reader on a request database: two statements per visit (D-3). @param db - request database @returns the overview reader port */
export function createDrizzleDashboardOverviewReader(db: DbExecutor): DashboardOverviewReaderPort {
  return {
    async readMetrics(context, windows) {
      const result = await db.execute(buildDashboardMetricsSql(context, windows));
      const row = dashboardMetricsRowSchema.parse(result.rows.at(0));
      return {
        newThisMonth: row.new_this_month,
        newPrev: row.new_prev,
        toReview: row.to_review,
        toReviewWaiting: row.to_review_waiting,
        inEditing: row.in_editing,
        inEditingReady: row.in_editing_ready,
        deliveredThisMonth: row.delivered_this_month,
        deliveredPrev: row.delivered_prev,
        newByMonth: row.new_by_month,
        deliveredByMonth: row.delivered_by_month,
      };
    },
    async listActiveProjects(context, query) {
      const result = await db.execute(buildDashboardProjectsSql(context, query));
      const rows = result.rows.flatMap((raw) => {
        const row = toRow(raw);
        // The amount is canonicalised before it reaches formatIdr (D-9, ADR-007).
        if (row === null) return [];
        return [{ ...row, agreedPrice: canonicalIdrAmount(String(raw.agreed_price)) }];
      });
      return { rows, total: Number(result.rows.at(0)?.total ?? 0) };
    },
  };
}
