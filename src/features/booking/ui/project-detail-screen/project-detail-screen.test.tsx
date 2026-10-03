import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProjectDetailView } from "@/features/booking/application/use-cases/get-project-detail/get-project-detail.types";
import { buildProjectMenu } from "@/features/booking/domain/project-menu/project-menu";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";

import type { ProjectMenuActions } from "../project-menu-host/project-menu-host.types";
import { ProjectDetailScreen } from "./project-detail-screen";

const { isMobile, refresh, showToast } = vi.hoisted(() => ({
  isMobile: { value: false },
  refresh: vi.fn(),
  showToast: vi.fn(),
}));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => isMobile.value,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push: vi.fn() }) }));
vi.mock("@/ui/patterns/compact-bar/compact-bar-actions", () => ({
  CompactBarActions: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="compact-actions">{children}</div>
  ),
}));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));
vi.mock("@/ui/patterns/page-actions/page-actions", () => ({
  PageActions: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-actions">{children}</div>
  ),
}));

const STEP: Record<ProjectStatus, ProjectDetailView["nextStep"]> = {
  DRAFT: "CONFIRM_BOOKING",
  BOOKED: "START_SHOOTING",
  SHOOTING: "FINISH_SHOOTING",
  POST_PROCESSING: null,
  DELIVERED: null,
  COMPLETED: null,
  CANCELLED: null,
};

function view(
  status: ProjectStatus,
  overrides: Partial<ProjectDetailView> = {},
): ProjectDetailView {
  const sessions = [
    {
      id: "s1",
      name: "Foto keluarga",
      date: "2026-11-10",
      startTime: "06:30",
      endTime: "07:15",
      location: "Rumah Rina, Depok",
      createdAt: "2026-10-01T00:00:00Z",
    },
    {
      id: "s2",
      name: "Wisuda",
      date: "2026-11-10",
      startTime: "07:30",
      endTime: "10:00",
      location: "Balairung UI, Depok",
      createdAt: "2026-10-01T00:00:01Z",
    },
  ];
  return {
    id: "p1",
    title: "Wisuda Basic — Rina",
    notes: "Keluarga datang dari Bandung.",
    agreedPrice: "700000",
    currency: "IDR",
    status,
    client: { id: "c1", name: "Rina", whatsappNumber: "6281234567890" },
    service: { id: "sv1", name: "Wisuda Basic", basePrice: "750000" },
    items: [
      {
        id: "i1",
        definitionId: "d1",
        name: "Foto edit",
        unit: "foto",
        valueType: "NUMBER",
        selectionRequired: true,
        selectionType: "EDIT",
        value: { type: "NUMBER", value: "25" },
      },
    ],
    fields: [
      {
        id: "f1",
        key: "nama_kampus",
        name: "Nama kampus",
        fieldType: "TEXT",
        isRequired: true,
        options: null,
        value: "Universitas Indonesia",
      },
      {
        id: "f2",
        key: "ukuran_toga",
        name: "Ukuran toga",
        fieldType: "SELECT",
        isRequired: false,
        options: ["S"],
        value: null,
      },
    ],
    sessions,
    cancellation: null,
    shownSession: { session: sessions[0], extraCount: 1, isPast: false },
    nextStep: STEP[status],
    canEditDeal: status === "DRAFT" || status === "BOOKED",
    canEditSchedule: status !== "CANCELLED",
    canEditInfo: status !== "CANCELLED",
    menu: buildProjectMenu({ status, hasWhatsappNumber: true }),
    ...overrides,
  };
}

function menuActions(advanceAction: ProjectMenuActions["advanceAction"]): ProjectMenuActions {
  return {
    advanceAction,
    updateInfoAction: vi.fn(),
    cancelAction: vi.fn(),
    deleteDraftAction: vi.fn(),
    loadDetailAction: vi.fn(),
    loadClientAction: vi.fn(),
    updateClientAction: vi.fn(),
  };
}

function renderScreen(
  project: ProjectDetailView,
  advance = vi.fn(() => Promise.resolve(undefined)),
) {
  render(
    <ProjectDetailScreen workspaceId="ws" project={project} menuActions={menuActions(advance)} />,
  );
  return advance;
}

describe("ProjectDetailScreen", () => {
  beforeEach(() => {
    isMobile.value = false;
    refresh.mockClear();
    showToast.mockClear();
  });

  it("AC-PRJ-015 shows Info, Isi paket, Jadwal and Field booking for a booked project", () => {
    renderScreen(view("BOOKED"));
    expect(screen.getByText("Rina · +62 812-3456-7890")).toBeInTheDocument();
    expect(screen.getByText("Rp 700.000")).toBeInTheDocument();
    expect(screen.getByText("Keluarga datang dari Bandung.")).toBeInTheDocument();
    expect(
      screen.getByText("Disalin dari Wisuda Basic. Bisa diubah sampai pemotretan dimulai."),
    ).toBeInTheDocument();
    expect(screen.getByText("Foto edit")).toBeInTheDocument();
    expect(screen.getByText("Sesi pemotretan, urut tanggal.")).toBeInTheDocument();
    expect(
      screen.getByText("Sel, 10 Nov 2026 · 06.30–07.15 · Rumah Rina, Depok"),
    ).toBeInTheDocument();
    expect(screen.getByText("Disalin dari Wisuda Basic saat proyek dibuat.")).toBeInTheDocument();
    expect(screen.getByText("Universitas Indonesia")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("AC-PRJ-009 AC-PRJ-020 offers the right step with its icon label for each status", () => {
    for (const [status, label] of [
      ["DRAFT", "Konfirmasi booking"],
      ["BOOKED", "Mulai pemotretan"],
      ["SHOOTING", "Selesai pemotretan"],
    ] as const) {
      const { unmount } = render(
        <ProjectDetailScreen
          workspaceId="ws"
          project={view(status)}
          menuActions={menuActions(vi.fn())}
        />,
      );
      expect(
        within(screen.getByTestId("page-actions")).getByRole("button", { name: label }),
      ).toBeInTheDocument();
      unmount();
    }
  });

  it.each(["POST_PROCESSING", "DELIVERED", "COMPLETED", "CANCELLED"] as const)(
    "AC-PRJ-020 offers no step for %s",
    (status) => {
      renderScreen(view(status));
      expect(
        within(screen.getByTestId("page-actions")).queryByRole("button", {
          name: /booking|pemotretan/i,
        }),
      ).not.toBeInTheDocument();
    },
  );

  it("AC-PRJ-018 shows the empty schedule of a draft", () => {
    renderScreen(view("DRAFT", { sessions: [], shownSession: null }));
    expect(screen.getByText("Belum ada sesi")).toBeInTheDocument();
    expect(
      screen.getByText("Tambahkan minimal satu sesi sebelum konfirmasi booking."),
    ).toBeInTheDocument();
  });

  it("AC-PRJ-016 explains that the package and booking values are locked once shooting starts", () => {
    renderScreen(view("SHOOTING"));
    expect(screen.getAllByText("Terkunci sejak pemotretan dimulai.")).toHaveLength(2);
  });

  it("AC-PRJ-016 explains that a cancelled project cannot change and shows who cancelled", () => {
    renderScreen(
      view("CANCELLED", {
        cancellation: {
          at: "2026-11-04T03:00:00Z",
          byName: "Rina Saputri",
          reason: "wisuda diundur ke semester depan",
        },
      }),
    );
    expect(screen.getByText("Proyek dibatalkan")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Dibatalkan oleh Rina Saputri pada Rab, 4 Nov 2026. Alasan: wisuda diundur ke semester depan.",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Proyek dibatalkan, tidak bisa diubah.")).toHaveLength(3);
  });

  it("AC-PRJ-016 leaves the reason out of a cancellation without one", () => {
    renderScreen(
      view("CANCELLED", {
        cancellation: { at: "2026-11-04T03:00:00Z", byName: "Rina Saputri", reason: null },
      }),
    );
    expect(
      screen.getByText("Dibatalkan oleh Rina Saputri pada Rab, 4 Nov 2026."),
    ).toBeInTheDocument();
  });

  it("AC-PRJ-020 shows the Loading label and disables the button while a step runs", async () => {
    const pending = new Promise<undefined>(() => undefined);
    renderScreen(
      view("BOOKED"),
      vi.fn(() => pending),
    );
    await userEvent.click(screen.getByRole("button", { name: "Mulai pemotretan" }));
    const button = screen.getByRole("button", { name: "Mulai pemotretan…" });
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("AC-PRJ-020 sends the step to the action and toasts the result", async () => {
    const advance = renderScreen(view("BOOKED"));
    await userEvent.click(screen.getByRole("button", { name: "Mulai pemotretan" }));
    expect(advance).toHaveBeenCalledWith("ws", "p1", "START_SHOOTING");
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "success", title: "Pemotretan dimulai" }),
    );
  });

  it("AC-PRJ-015 puts the chip, session line and a full-width step in the phone layout", () => {
    isMobile.value = true;
    renderScreen(view("BOOKED"));
    expect(screen.getByText("Dibooking")).toBeInTheDocument();
    expect(
      screen.getByText("Sesi berikutnya Sel, 10 Nov 2026 · 06.30 · Rumah Rina, Depok · +1 sesi"),
    ).toBeInTheDocument();
    expect(screen.getByText("Bisa diubah sampai pemotretan dimulai.")).toBeInTheDocument();
    expect(screen.getByText("Urut tanggal.")).toBeInTheDocument();
    expect(screen.queryByTestId("page-actions")).not.toBeInTheDocument();
    expect(screen.getByTestId("compact-actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mulai pemotretan" })).toBeInTheDocument();
  });

  it("AC-PRJ-015 has no step bar on a phone for a project without a step", () => {
    isMobile.value = true;
    renderScreen(view("POST_PROCESSING"));
    expect(screen.queryByRole("button", { name: /booking|pemotretan/i })).not.toBeInTheDocument();
  });
});
