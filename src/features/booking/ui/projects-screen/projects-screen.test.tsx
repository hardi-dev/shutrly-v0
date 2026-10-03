import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProjectListRow } from "@/features/booking/application/ports/project-list-reader/project-list-reader.port";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";

import { ProjectsScreen } from "./projects-screen";

const { isMobile, push, replace } = vi.hoisted(() => ({
  isMobile: { value: false },
  push: vi.fn(),
  replace: vi.fn(),
}));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => isMobile.value,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));
vi.mock("@/ui/patterns/page-actions/page-actions", () => ({
  PageActions: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-actions">{children}</div>
  ),
}));

const FILTER_PROPS = {
  filter: {
    statuses: [],
    from: null,
    to: null,
    includeNoSchedule: false,
    serviceIds: [],
    clientId: null,
  },
  services: [],
  filterClient: null,
  searchClientsAction: vi.fn(() => Promise.resolve([])),
  menuActions: {
    advanceAction: vi.fn(),
    updateInfoAction: vi.fn(),
    cancelAction: vi.fn(),
    deleteDraftAction: vi.fn(),
    loadDetailAction: vi.fn(),
    loadClientAction: vi.fn(),
    updateClientAction: vi.fn(),
  },
} as const;

const WITH_SESSION: ProjectListRow = {
  id: "p1",
  title: "Wisuda Basic — Rina",
  status: "BOOKED",
  clientId: "c1",
  clientName: "Rina",
  clientWhatsappNumber: null,
  serviceName: "Wisuda Basic",
  shownSession: {
    id: "s1",
    name: "Wisuda",
    date: "2026-11-10",
    startTime: "07:30",
    endTime: null,
    location: "Balairung UI, Depok",
    createdAt: "2026-10-01T00:00:00Z",
  },
  sessionCount: 2,
};
const NO_SESSION: ProjectListRow = {
  ...WITH_SESSION,
  id: "p2",
  title: "Wisuda Basic — Sari",
  status: "DRAFT",
  clientName: "Sari",
  shownSession: null,
  sessionCount: 0,
};

function renderScreen(
  rows: readonly ProjectListRow[],
  overrides: { tab?: ProjectTab; q?: string; nextCursor?: string | null; count?: number } = {},
  loadMore = vi.fn(() => Promise.resolve({ items: [NO_SESSION], nextCursor: null })),
) {
  render(
    <ProjectsScreen
      workspaceId="ws"
      tab={overrides.tab ?? "ACTIVE"}
      count={overrides.count ?? rows.length}
      q={overrides.q ?? ""}
      initialPage={{ items: rows, nextCursor: overrides.nextCursor ?? null }}
      loadMoreAction={loadMore}
      {...FILTER_PROPS}
    />,
  );
  return loadMore;
}

describe("ProjectsScreen", () => {
  beforeEach(() => {
    isMobile.value = false;
    push.mockClear();
    replace.mockClear();
  });

  it("AC-PRJ-001 AC-PRJ-003 shows the table with the count, link, event and status", () => {
    renderScreen([WITH_SESSION, NO_SESSION], { count: 12 });
    expect(screen.getByText("12 proyek aktif")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Wisuda Basic — Rina" });
    expect(link).toHaveAttribute("href", "/w/ws/projects/p1");
    expect(screen.getByText("Rina · Wisuda Basic")).toBeInTheDocument();
    expect(screen.getByText("Sel, 10 Nov 2026 · 07.30")).toBeInTheDocument();
    expect(screen.getByText("Balairung UI, Depok · +1 sesi")).toBeInTheDocument();
    expect(screen.getByText("Belum ada jadwal")).toBeInTheDocument();
    expect(screen.getByText("Dibooking")).toBeInTheDocument();
    expect(screen.getByText("Draf")).toBeInTheDocument();
    expect(screen.getByTestId("page-actions")).toHaveTextContent("Proyek baru");
  });

  it("AC-PRJ-003 counts the other tabs with their own noun", () => {
    renderScreen([WITH_SESSION], { tab: "COMPLETED", count: 4 });
    expect(screen.getByText("4 proyek selesai")).toBeInTheDocument();
  });

  it("AC-PRJ-001 shows the empty state of each tab", () => {
    const { unmount } = render(
      <ProjectsScreen
        workspaceId="ws"
        tab="ACTIVE"
        count={0}
        q=""
        initialPage={{ items: [], nextCursor: null }}
        loadMoreAction={vi.fn()}
        {...FILTER_PROPS}
      />,
    );
    expect(screen.getByText("Belum ada proyek")).toBeInTheDocument();
    unmount();
    renderScreen([], { tab: "COMPLETED" });
    expect(screen.getByText("Belum ada proyek yang selesai")).toBeInTheDocument();
  });

  it("AC-PRJ-004 shows the no-match state and keeps the tab total", () => {
    renderScreen([], { q: "andra", count: 12 });
    expect(screen.getByText("Tidak ada proyek yang cocok")).toBeInTheDocument();
    expect(screen.getByText("12 proyek aktif")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hapus pencarian" })).toHaveAttribute(
      "href",
      "/w/ws/projects",
    );
  });

  it("AC-PRJ-005 appends the next page when Muat lebih banyak is pressed", async () => {
    const loadMore = renderScreen([WITH_SESSION], { nextCursor: "p1" });
    await userEvent.click(screen.getByRole("button", { name: "Muat lebih banyak" }));
    expect(loadMore).toHaveBeenCalledWith("ws", {
      tab: "ACTIVE",
      q: "",
      filter: FILTER_PROPS.filter,
      afterId: "p1",
    });
    expect(await screen.findByRole("link", { name: "Wisuda Basic — Sari" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wisuda Basic — Rina" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Muat lebih banyak" })).not.toBeInTheDocument();
  });

  it("AC-PRJ-001 renders the phone list with tabs, the short date and Baru", async () => {
    isMobile.value = true;
    renderScreen([WITH_SESSION, NO_SESSION]);
    expect(screen.getByRole("radio", { name: "Aktif" })).toBeInTheDocument();
    expect(screen.getByText("Rina · 10 Nov 2026")).toBeInTheDocument();
    expect(screen.getByText("Sari · Belum ada jadwal")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Baru" }));
    expect(push).toHaveBeenCalledWith("/w/ws/projects/new");
    await userEvent.click(screen.getByRole("radio", { name: "Selesai" }));
    expect(push).toHaveBeenCalledWith("/w/ws/projects/completed");
  });

  it("AC-PRJ-004 writes the search to the URL after the debounce and clears it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderScreen([WITH_SESSION], { tab: "COMPLETED" });
    const search = screen.getByRole("searchbox", { name: "Cari judul atau nama klien" });
    await userEvent.type(search, "rina");
    expect(replace).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(350);
    expect(replace).toHaveBeenLastCalledWith("/w/ws/projects/completed?q=rina");
    await userEvent.click(
      within(search.closest("span") ?? document.body).getByRole("button", {
        name: "Hapus pencarian",
      }),
    );
    expect(replace).toHaveBeenLastCalledWith("/w/ws/projects/completed");
    vi.useRealTimers();
  });
});
