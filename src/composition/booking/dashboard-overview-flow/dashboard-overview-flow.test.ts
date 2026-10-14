import { beforeEach, describe, expect, it, vi } from "vitest";

const overview = { tiles: {}, table: { rows: [], total: 0, search: "rina", filter: null } };
const loadOverview = vi.fn(() => Promise.resolve(overview));
const reader = { readMetrics: vi.fn(), listActiveProjects: vi.fn() };
const projects = {
  listServicesForFilter: vi.fn(() => Promise.resolve([])),
  findFilterClient: vi.fn(),
};

vi.mock(
  "@/features/booking/application/use-cases/load-dashboard-overview/load-dashboard-overview",
  () => ({
    loadDashboardOverview: loadOverview,
  }),
);
vi.mock("@/adapters/db/project-repository/drizzle-dashboard-overview-reader", () => ({
  createDrizzleDashboardOverviewReader: () => reader,
}));
vi.mock("@/adapters/db/project-repository/drizzle-project-repository", () => ({
  createDrizzleProjectRepository: () => projects,
}));
vi.mock("../../request-db/request-db", () => ({
  withRequestDb: (work: (db: unknown) => Promise<unknown>) => work({}),
}));

const { loadDashboardOverview } = await import("./dashboard-overview-flow");

const context = { workspaceId: "11111111-1111-4111-8111-111111111111" } as never;
const now = new Date("2026-10-14T03:00:00Z");

describe("dashboard-overview-flow (AC-DASH-001, 036, 037)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses the search param and passes the verified context and the clock", async () => {
    const data = await loadDashboardOverview(context, { q: "rina" }, now);

    expect(loadOverview).toHaveBeenCalledWith(
      reader,
      context,
      expect.objectContaining({ q: "rina", now }),
    );
    expect(data.overview).toBe(overview);
  });

  it("reads no filter client when the filter names none", async () => {
    const data = await loadDashboardOverview(context, {}, now);

    expect(projects.findFilterClient).not.toHaveBeenCalled();
    expect(data.filterClient).toBeNull();
  });
});
