import { describe, expect, it } from "vitest";

import {
  buildMetricTiles,
  DASHBOARD_TABLE_LIMIT,
  metricWindows,
  REVIEW_WAITING_DAYS,
} from "./dashboard-metrics";
import type { MetricFacts } from "./dashboard-metrics.types";

const SEVEN_MONTHS = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];

const facts = (overrides: Partial<MetricFacts> = {}): MetricFacts => ({
  newThisMonth: 0,
  newPrev: 0,
  toReview: 0,
  toReviewWaiting: 0,
  inEditing: 0,
  inEditingReady: 0,
  deliveredThisMonth: 0,
  deliveredPrev: 0,
  newByMonth: [],
  deliveredByMonth: [],
  ...overrides,
});

const windowsAt = (iso: string) => metricWindows(new Date(iso));

describe("metricWindows (D-4, D-5, D-6, FC-001)", () => {
  it("AC-DASH-022 derives the month, same-days, and seven-month windows from today", () => {
    expect(windowsAt("2026-10-14T03:00:00Z")).toMatchObject({
      today: "2026-10-14",
      monthStart: "2026-10-01",
      prevMonthStart: "2026-09-01",
      prevEnd: "2026-09-15",
      sparkStart: "2026-04-01",
      months: SEVEN_MONTHS,
    });
  });

  it("caps the same-days window at this month's first day for the 31st", () => {
    expect(windowsAt("2026-10-31T03:00:00Z").prevEnd).toBe("2026-10-01");
  });

  it("caps the same-days window for 31 March at 1 March", () => {
    expect(windowsAt("2026-03-31T03:00:00Z").prevEnd).toBe("2026-03-01");
  });

  it("AC-DASH-025 uses the Jakarta calendar day at the month boundary", () => {
    expect(windowsAt("2026-09-30T16:30:00Z").monthStart).toBe("2026-09-01");
    expect(windowsAt("2026-09-30T17:30:00Z").monthStart).toBe("2026-10-01");
  });
});

describe("buildMetricTiles (AC-DASH-033, 034, 035)", () => {
  const windows = windowsAt("2026-10-14T03:00:00Z");

  it("AC-DASH-033 shows a positive trend for a gain and a warning trend for a loss", () => {
    const tiles = buildMetricTiles(
      facts({ newThisMonth: 4, newPrev: 3, deliveredThisMonth: 1, deliveredPrev: 3 }),
      windows,
    );
    expect(tiles.newProjects.trend).toEqual({ delta: 1, tone: "positive" });
    expect(tiles.delivered.trend).toEqual({ delta: -2, tone: "warning" });
  });

  it("AC-DASH-033 shows no trend when the counts are equal", () => {
    const tiles = buildMetricTiles(facts({ newThisMonth: 2, newPrev: 2 }), windows);
    expect(tiles.newProjects.trend).toBeNull();
  });

  it("AC-DASH-034 fills missing months with zero, oldest first", () => {
    const tiles = buildMetricTiles(
      facts({
        newByMonth: [
          { month: "2026-04", count: 2 },
          { month: "2026-10", count: 5 },
        ],
      }),
      windows,
    );
    expect(tiles.newProjects.spark).toEqual([2, 0, 0, 0, 0, 0, 5]);
    expect(tiles.delivered.spark).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("AC-DASH-035 returns the waiting and ready parts of the live tiles", () => {
    const tiles = buildMetricTiles(
      facts({ toReview: 2, toReviewWaiting: 1, inEditing: 4, inEditingReady: 3 }),
      windows,
    );
    expect(tiles.toReview.ring).toEqual({ part: 1, total: 2 });
    expect(tiles.inEditing.ring).toEqual({ part: 3, total: 4 });
  });

  it("AC-DASH-035 keeps an empty ring for a zero share and no ring for a zero count", () => {
    const tiles = buildMetricTiles(facts({ inEditing: 2, inEditingReady: 0 }), windows);
    expect(tiles.inEditing.ring).toEqual({ part: 0, total: 2 });
    expect(buildMetricTiles(facts(), windows).inEditing.ring).toBeNull();
  });

  it("AC-DASH-023 uses the to-review count as the waiting badge, and none at zero", () => {
    expect(buildMetricTiles(facts({ toReview: 2 }), windows).toReview.waiting).toBe(2);
    expect(buildMetricTiles(facts(), windows).toReview.waiting).toBeNull();
  });
});

describe("dashboard constants (A-2, A-7)", () => {
  it("names the review waiting window and the table cap", () => {
    expect(REVIEW_WAITING_DAYS).toBe(3);
    expect(DASHBOARD_TABLE_LIMIT).toBe(10);
  });
});
