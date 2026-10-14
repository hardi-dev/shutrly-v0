import { z } from "zod";

const monthlySeriesSchema = z.array(
  z.object({ month: z.string(), count: z.number().int().min(0) }),
);

// One row of the metrics statement (dashboard-metrics-sql.ts). Every count is a non-negative integer.
export const dashboardMetricsRowSchema = z.object({
  new_this_month: z.number().int().min(0),
  new_prev: z.number().int().min(0),
  to_review: z.number().int().min(0),
  to_review_waiting: z.number().int().min(0),
  in_editing: z.number().int().min(0),
  in_editing_ready: z.number().int().min(0),
  delivered_this_month: z.number().int().min(0),
  delivered_prev: z.number().int().min(0),
  new_by_month: monthlySeriesSchema,
  delivered_by_month: monthlySeriesSchema,
});
