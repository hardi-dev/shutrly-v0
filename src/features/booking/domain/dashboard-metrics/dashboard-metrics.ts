import { todayInScheduleZone } from "../schedule-clock/schedule-clock";
import type {
  MetricFacts,
  MetricRing,
  MetricTiles,
  MetricTrend,
  MetricWindows,
  MonthlyCount,
} from "./dashboard-metrics.types";

/** A selection group counts as waiting once it has been submitted this many days (A-7). */
export const REVIEW_WAITING_DAYS = 3;
/** The dashboard's active-projects table shows this many rows (A-2). */
export const DASHBOARD_TABLE_LIMIT = 10;
// Seven bars: six months back plus the current month (AC-DASH-034).
const SPARK_BAR_COUNT = 7;

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

function shiftMonth(firstOfMonth: string, months: number): string {
  const [year, month] = firstOfMonth.split("-").map(Number);
  return isoDay(new Date(Date.UTC(year, month - 1 + months, 1)));
}

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDay(date);
}

/** Derives the month, same-days and sparkline windows from one instant, in the schedule zone (D-4, D-5, D-6). @param now - the instant @returns the windows */
export function metricWindows(now: Date): MetricWindows {
  const today = todayInScheduleZone(now);
  const monthStart = `${today.slice(0, 7)}-01`;
  const prevMonthStart = shiftMonth(monthStart, -1);
  const dayOfMonth = Number(today.slice(8, 10));
  const sameDaysEnd = addDays(prevMonthStart, dayOfMonth);
  const months = Array.from({ length: SPARK_BAR_COUNT }, (_, index) =>
    shiftMonth(monthStart, index - (SPARK_BAR_COUNT - 1)).slice(0, 7),
  );
  return {
    today,
    monthStart,
    prevMonthStart,
    prevEnd: sameDaysEnd < monthStart ? sameDaysEnd : monthStart,
    sparkStart: `${months[0]}-01`,
    months,
    now,
  };
}

/** Returns the trend for a monthly pair, or null when the counts are equal (AC-DASH-033). @param current - this month @param previous - the same days last month @returns the trend or null */
function trendOf(current: number, previous: number): MetricTrend | null {
  const delta = current - previous;
  if (delta === 0) return null;
  return { delta, tone: delta > 0 ? "positive" : "warning" };
}

/** Returns the ring for a live tile, or null when nothing is counted (AC-DASH-035). @param part - the part that is ready or waiting @param total - the count @returns the ring or null */
function ringOf(part: number, total: number): MetricRing | null {
  return total === 0 ? null : { part, total };
}

/** Fills the seven month keys oldest first, with zero for a missing month (AC-DASH-034). @param series - the monthly counts @param months - the month keys @returns seven counts */
function sparkOf(series: readonly MonthlyCount[], months: readonly string[]): number[] {
  return months.map((month) => series.find((entry) => entry.month === month)?.count ?? 0);
}

/** Builds the four metric tiles from the counted facts (AC-DASH-022…035). @param facts - the stored counts @param windows - the windows the counts used @returns the tile values */
export function buildMetricTiles(facts: MetricFacts, windows: MetricWindows): MetricTiles {
  return {
    newProjects: {
      value: facts.newThisMonth,
      trend: trendOf(facts.newThisMonth, facts.newPrev),
      spark: sparkOf(facts.newByMonth, windows.months),
    },
    toReview: {
      value: facts.toReview,
      waiting: facts.toReview === 0 ? null : facts.toReview,
      ring: ringOf(facts.toReviewWaiting, facts.toReview),
    },
    inEditing: {
      value: facts.inEditing,
      ring: ringOf(facts.inEditingReady, facts.inEditing),
    },
    delivered: {
      value: facts.deliveredThisMonth,
      trend: trendOf(facts.deliveredThisMonth, facts.deliveredPrev),
      spark: sparkOf(facts.deliveredByMonth, windows.months),
    },
  };
}
