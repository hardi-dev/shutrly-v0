import { beforeEach, describe, expect, it, vi } from "vitest";

const workspace = { id: "ws-1", name: "Aster Wedding" };
const context = { workspaceId: "ws-1" };
const enterWorkspace = vi.fn(() => Promise.resolve({ workspace, context }));
const loadSetupChecklist = vi.fn();
const loadDashboardOverview = vi.fn(() =>
  Promise.resolve({ overview: {}, services: [], filterClient: null }),
);

vi.mock("../owner-workspace/owner-workspace", () => ({ enterWorkspace }));
vi.mock("../../request-db/request-db", () => ({
  withRequestDb: (work: (db: unknown) => Promise<unknown>) => work({}),
}));
vi.mock("@/adapters/db/setup-facts-reader/drizzle-setup-facts-reader", () => ({
  createDrizzleSetupFactsReader: () => ({}),
}));
vi.mock(
  "@/features/workspace/application/use-cases/load-setup-checklist/load-setup-checklist",
  () => ({
    loadSetupChecklist,
  }),
);
vi.mock("@/composition/booking/dashboard-overview-flow/dashboard-overview-flow", () => ({
  loadDashboardOverview,
}));

const { loadDashboard } = await import("./dashboard-flow");

describe("loadDashboard (AC-DASH-001, 002)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-DASH-002 shows the checklist and no overview until the workspace has a project", async () => {
    const checklist = { steps: [] };
    loadSetupChecklist.mockResolvedValue(checklist);

    const data = await loadDashboard("ws-1", { q: "rina" });

    expect(data.checklist).toBe(checklist);
    expect(data.overview).toBeNull();
    expect(loadDashboardOverview).not.toHaveBeenCalled();
  });

  it("AC-DASH-001 loads the overview with the search params once there is a project", async () => {
    loadSetupChecklist.mockResolvedValue(null);

    const data = await loadDashboard("ws-1", { q: "rina" });

    expect(data.checklist).toBeNull();
    expect(loadDashboardOverview).toHaveBeenCalledWith(context, { q: "rina" }, expect.any(Date));
    expect(data.overview).not.toBeNull();
  });
});
