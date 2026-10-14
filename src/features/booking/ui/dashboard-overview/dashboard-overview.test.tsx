import { screen, within } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { useLocale } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ActiveProjectRow } from "@/features/booking/application/ports/dashboard-overview-reader/dashboard-overview-reader.port";
import type { DashboardOverview } from "@/features/booking/application/use-cases/load-dashboard-overview/load-dashboard-overview.types";
import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { EMPTY_PROJECT_FILTER } from "@/features/booking/domain/project-list-query/project-list-filter";

import { DashboardOverview as Overview } from "./dashboard-overview";

const { push, replace, refresh, isMobile } = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  isMobile: { value: false },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace, refresh }) }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => isMobile.value,
}));
vi.mock("@/ui/patterns/page-actions/page-actions", () => ({
  PageActions: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-actions">{children}</div>
  ),
}));

const menuActions = {
  advanceAction: vi.fn(),
  updateInfoAction: vi.fn(),
  cancelAction: vi.fn(),
  deleteDraftAction: vi.fn(),
  loadDetailAction: vi.fn(),
  loadClientAction: vi.fn(),
  updateClientAction: vi.fn(),
};

function row(overrides: Partial<ActiveProjectRow>): ActiveProjectRow {
  return {
    id: "p1",
    title: "Wisuda Rina",
    status: "BOOKED",
    clientId: "c1",
    clientName: "Rina Saputri",
    clientWhatsappNumber: null,
    serviceName: "Wisuda Basic",
    shownSession: null,
    sessionCount: 0,
    hasTeam: false,
    agreedPrice: "750000",
    ...overrides,
  };
}

const ROWS: readonly ActiveProjectRow[] = [
  row({
    id: "p1",
    title: "Wisuda Rina",
    shownSession: {
      id: "s1",
      name: "Akad",
      date: "2026-10-14",
      startTime: null,
      endTime: null,
      location: null,
      createdAt: "2026-10-01T00:00:00Z",
    },
  }),
  row({
    id: "p2",
    title: "Prewed Dewi",
    status: "SHOOTING",
    shownSession: {
      id: "s2",
      name: "Foto",
      date: "2026-10-14",
      startTime: "09:00",
      endTime: null,
      location: null,
      createdAt: "2026-10-01T00:00:00Z",
    },
  }),
  row({
    id: "p3",
    title: "Wisuda Sari",
    status: "DRAFT",
    shownSession: {
      id: "s3",
      name: "Akad",
      date: "2026-10-18",
      startTime: "07:00",
      endTime: null,
      location: null,
      createdAt: "2026-10-01T00:00:00Z",
    },
  }),
  row({ id: "p4", title: "Wisuda Budi", status: "DELIVERED", clientName: "Budi" }),
];

const TILES: DashboardOverview["tiles"] = {
  newProjects: { value: 3, trend: { delta: 1, tone: "positive" }, spark: [0, 0, 0, 0, 0, 0, 3] },
  toReview: { value: 2, waiting: 2, ring: { part: 1, total: 2 } },
  inEditing: { value: 2, ring: { part: 1, total: 2 } },
  delivered: { value: 1, trend: { delta: -2, tone: "warning" }, spark: [0, 0, 0, 0, 0, 0, 1] },
};

function overviewWith(table: Partial<DashboardOverview["table"]>): DashboardOverview {
  return {
    tiles: TILES,
    today: "2026-10-14",
    table: {
      rows: ROWS,
      total: 12,
      search: null,
      filter: EMPTY_PROJECT_FILTER,
      ...table,
    },
  };
}

function renderOverview(overview: DashboardOverview, locale: "en" | "id" = "en") {
  vi.mocked(useLocale).mockReturnValue(locale);
  return renderInLocale(
    <Overview
      workspaceId="ws"
      overview={overview}
      services={[]}
      filterClient={null}
      menuActions={menuActions}
      searchClientsAction={vi.fn(() => Promise.resolve([]))}
    />,
    locale,
  );
}

describe("DashboardOverview (F-26)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-DASH-021 puts New project in the page header", () => {
    renderOverview(overviewWith({}));
    expect(screen.getByTestId("page-actions")).toHaveTextContent("New project");
  });

  it("AC-DASH-033 shows the trend badges and the waiting badge on the tiles", () => {
    renderOverview(overviewWith({}));
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.getByText("+1 compared with the same days last month")).toBeInTheDocument();
    expect(screen.getByText("−2")).toBeInTheDocument();
    expect(screen.getByText("2 waiting")).toBeInTheDocument();
  });

  it("AC-DASH-035 speaks the rings for the live tiles", () => {
    renderOverview(overviewWith({}));
    expect(screen.getByRole("img", { name: "1 of 2 waiting 3 days or more" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "1 of 2 ready to edit" })).toBeInTheDocument();
  });

  it("AC-DASH-027 labels the next session: today, today with a time, a date, or none", () => {
    renderOverview(overviewWith({}));
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Today, 09:00")).toBeInTheDocument();
    expect(screen.getByText("Sun, Oct 18, 07:00")).toBeInTheDocument();
    expect(screen.getByText("No sessions scheduled")).toBeInTheDocument();
  });

  it("AC-DASH-026 shows the count footer and the link to the active list", () => {
    renderOverview(overviewWith({}));
    expect(screen.getByText("Showing 4 of 12 active projects")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all projects" })).toHaveAttribute(
      "href",
      "/w/ws/projects",
    );
  });

  it("AC-DASH-036 keeps the search in the footer link", () => {
    renderOverview(overviewWith({ search: "rina" }));
    expect(screen.getByRole("link", { name: "View all projects" })).toHaveAttribute(
      "href",
      "/w/ws/projects?q=rina",
    );
  });

  it("AC-DASH-018 formats the agreed price in IDR", () => {
    renderOverview(overviewWith({}));
    expect(screen.getAllByText(formatIdr("750000", "en-US"))).toHaveLength(ROWS.length);
  });

  it("AC-DASH-030 gives each row the project list's menu, named for the project", () => {
    renderOverview(overviewWith({}));
    expect(screen.getByRole("button", { name: "Actions for Wisuda Rina" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actions for Prewed Dewi" })).toBeInTheDocument();
  });

  it("AC-DASH-029 shows the no-active state with no search or filter when nothing is active", () => {
    renderOverview(overviewWith({ rows: [], total: 0 }));
    expect(screen.getByText("No active projects")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View project list" })).toHaveAttribute(
      "href",
      "/w/ws/projects",
    );
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("AC-DASH-037 shows the no-match state with Clear search back to the overview", () => {
    renderOverview(overviewWith({ rows: [], total: 12, search: "Lamaran" }));
    expect(screen.getByText("No matching projects")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute("href", "/w/ws");
  });

  it("AC-DASH-018 renders the Indonesian copy and the time separator in the id locale", () => {
    renderOverview(overviewWith({}), "id");
    expect(screen.getByRole("heading", { name: "Proyek aktif" })).toBeInTheDocument();
    expect(screen.getByText("Menampilkan 4 dari 12 proyek aktif")).toBeInTheDocument();
    expect(screen.getByText("Hari ini, 09.00")).toBeInTheDocument();
    expect(within(screen.getByRole("grid")).getByText("Wisuda Rina")).toBeInTheDocument();
  });
});

describe("DashboardOverview on the phone (F-26 phone layout)", () => {
  beforeEach(() => {
    isMobile.value = true;
  });
  afterEach(() => {
    isMobile.value = false;
  });

  it("AC-DASH-021 adds no header action, since the shell's bottom action creates a project", () => {
    renderOverview(overviewWith({}));
    expect(screen.queryByTestId("page-actions")).not.toBeInTheDocument();
  });

  it("AC-DASH-033 lays the four tiles out two by two", () => {
    const { container } = renderOverview(overviewWith({}));
    expect(container.querySelector(".grid-cols-2")).not.toBeNull();
    expect(container.querySelector(".grid-cols-4")).toBeNull();
  });

  it("AC-DASH-030 shows each project as a list card with its client and next session", () => {
    renderOverview(overviewWith({}));
    expect(screen.getByRole("list", { name: "Active projects" })).toBeInTheDocument();
    expect(screen.getByText("Rina Saputri · Today")).toBeInTheDocument();
    expect(screen.getByText("Budi · No sessions scheduled")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actions for Wisuda Rina" })).toBeInTheDocument();
  });

  it("AC-DASH-026 shows the count as the card description and a full-width link", () => {
    renderOverview(overviewWith({}));
    expect(screen.getByText("Showing 4 of 12 active projects")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all projects" })).toHaveAttribute(
      "href",
      "/w/ws/projects",
    );
  });

  it("AC-DASH-029 shows the no-active state with no search on the phone", () => {
    renderOverview(overviewWith({ rows: [], total: 0 }));
    expect(screen.getByText("No active projects")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("AC-DASH-037 shows the no-match state with the search still in place", () => {
    renderOverview(overviewWith({ rows: [], total: 12, search: "Lamaran" }));
    expect(screen.getByRole("searchbox")).toHaveValue("Lamaran");
    expect(screen.getByText("No matching projects")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear search" })).toHaveAttribute("href", "/w/ws");
  });
});
