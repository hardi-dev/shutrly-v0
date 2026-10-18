import { describe, expect, it, vi } from "vitest";

import { DASHBOARD_TABLE_LIMIT } from "@/features/booking/domain/dashboard-metrics/dashboard-metrics";
import type { MetricFacts } from "@/features/booking/domain/dashboard-metrics/dashboard-metrics.types";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { DashboardOverviewReaderPort } from "../../ports/dashboard-overview-reader/dashboard-overview-reader.port";
import { loadDashboardOverview } from "./load-dashboard-overview";

const context = { workspaceId: asWorkspaceId("11111111-1111-4111-8111-111111111111") };
const now = new Date("2026-10-14T03:00:00Z");

const facts: MetricFacts = {
  newThisMonth: 3,
  newPrev: 2,
  toReview: 2,
  toReviewWaiting: 1,
  inEditing: 2,
  inEditingReady: 1,
  deliveredThisMonth: 1,
  deliveredPrev: 3,
  newByMonth: [],
  deliveredByMonth: [],
};

function fakeReader() {
  const readMetrics = vi.fn(() => Promise.resolve(facts));
  const listActiveProjects = vi.fn(() => Promise.resolve({ rows: [], total: 0 }));
  const reader: DashboardOverviewReaderPort = { readMetrics, listActiveProjects };
  return { reader, readMetrics, listActiveProjects };
}

describe("loadDashboardOverview (AC-DASH-003, 022…027, 036, 037)", () => {
  it("reads the metrics and the table with today from the clock and the table cap", async () => {
    const { reader, readMetrics, listActiveProjects } = fakeReader();
    await loadDashboardOverview(reader, context, { q: null, filter: null, now });

    expect(readMetrics).toHaveBeenCalledWith(
      context,
      expect.objectContaining({ today: "2026-10-14" }),
    );
    expect(listActiveProjects).toHaveBeenCalledWith(context, {
      search: null,
      filter: null,
      today: "2026-10-14",
      limit: DASHBOARD_TABLE_LIMIT,
    });
  });

  it("returns the tiles built from the facts (AC-DASH-022, 033)", async () => {
    const { reader } = fakeReader();
    const overview = await loadDashboardOverview(reader, context, { q: null, filter: null, now });

    expect(overview.tiles.newProjects.value).toBe(3);
    expect(overview.tiles.newProjects.trend).toEqual({ delta: 1, tone: "positive" });
    expect(overview.tiles.toReview.waiting).toBe(2);
  });

  it("trims the search and reads the filter, and echoes both for the table (AC-DASH-036, 037)", async () => {
    const { reader, listActiveProjects } = fakeReader();
    const filter = {
      statuses: ["BOOKED" as const],
      from: null,
      to: null,
      includeNoSchedule: false,
      serviceIds: [],
      clientId: null,
    };
    const overview = await loadDashboardOverview(reader, context, {
      q: "  rina  ",
      filter,
      now,
    });

    expect(listActiveProjects).toHaveBeenCalledWith(
      context,
      expect.objectContaining({ search: "rina", filter }),
    );
    expect(overview.table).toMatchObject({ search: "rina", filter, total: 0, rows: [] });
  });

  it("treats a blank search as no search", async () => {
    const { reader, listActiveProjects } = fakeReader();
    await loadDashboardOverview(reader, context, { q: "   ", filter: null, now });
    expect(listActiveProjects).toHaveBeenCalledWith(
      context,
      expect.objectContaining({ search: null }),
    );
  });

  it("rejects when a read fails, with no partial overview (AC-DASH-019)", async () => {
    const { reader, listActiveProjects } = fakeReader();
    const failure = new Error("connection reset");
    vi.mocked(reader.readMetrics).mockRejectedValueOnce(failure);

    await expect(
      loadDashboardOverview(reader, context, { q: null, filter: null, now }),
    ).rejects.toBe(failure);
    expect(listActiveProjects).toHaveBeenCalledTimes(1);
  });
});
