// @vitest-environment jsdom

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SelectionGroupsView } from "@/features/gallery/application/use-cases/list-selection-groups/list-selection-groups.types";
import { showToast } from "@/ui/patterns/toast/toast";

import type { LockSelectionAction } from "../use-lock-selection/use-lock-selection.types";
import { SelectionGroupsScreen } from "./selection-groups-screen";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const PAGE: SelectionGroupsView = {
  projectTitle: "Wisuda Rina",
  state: "REVIEW",
  galleryExists: true,
  groups: [
    {
      id: "g-edit",
      name: "Foto edit",
      unit: "foto",
      mode: "COUNT",
      status: "SUBMITTED",
      usage: 8,
      limit: 8,
      pickCount: 8,
      noteCount: 3,
      submittedAt: "2026-10-05T07:20:00.000Z",
      lockedAt: null,
      preview: { photoIds: ["p1", "p2"], more: 6 },
    },
    {
      id: "g-print",
      name: "Foto cetak",
      unit: "lembar",
      mode: "QUANTITY",
      status: "OPEN",
      usage: 1,
      limit: 2,
      pickCount: 1,
      noteCount: 0,
      submittedAt: null,
      lockedAt: null,
      preview: { photoIds: ["p3"], more: 0 },
    },
  ],
};

function renderScreen(lockAction: LockSelectionAction, page: SelectionGroupsView = PAGE) {
  render(
    <SelectionGroupsScreen workspaceId="w1" projectId="p1" page={page} lockAction={lockAction} />,
  );
}

const ok: LockSelectionAction = vi.fn(
  (_w: string, _p: string, input: { groupId: string; intent: "LOCK" | "CLOSE" }) =>
    Promise.resolve({
      ok: true as const,
      groupName: input.groupId === "g-edit" ? "Foto edit" : "Foto cetak",
    }),
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SelectionGroupsScreen (owner-1 exports)", () => {
  it("AC-SEL-010 shows the review banner, each group's line and the +n of its photo strip", () => {
    renderScreen(ok);
    expect(screen.getByText("Foto edit sudah dikirim klien")).toBeTruthy();
    expect(screen.getByText("Periksa pilihan, lalu kunci agar tidak berubah.")).toBeTruthy();
    expect(screen.getByText("8 dari 8 foto · 3 catatan · dikirim 5 Okt 2026")).toBeTruthy();
    expect(screen.getByText("1 dari 2 lembar dipilih")).toBeTruthy();
    expect(screen.getByText("+6")).toBeTruthy();
    expect(
      screen
        .getAllByRole("link", { name: "Lihat pilihan" })
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/w/w1/projects/p1/pilihan/g-edit", "/w/w1/projects/p1/pilihan/g-print"]);
  });

  it("AC-SEL-011 offers Kunci pilihan for a sent group and Tutup pilihan for an open one only", () => {
    renderScreen(ok);
    expect(screen.getAllByRole("button", { name: "Kunci pilihan" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Tutup pilihan" })).toHaveLength(1);
  });

  it("AC-SEL-011 confirms, locks the sent group with its intent, toasts and re-renders", async () => {
    const lockAction = vi.fn(ok);
    renderScreen(lockAction);
    await userEvent.click(screen.getByRole("button", { name: "Kunci pilihan" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Kunci pilihan Foto edit?")).toBeTruthy();
    expect(within(dialog).getByText("Klien tidak bisa mengubahnya lagi.")).toBeTruthy();
    expect(lockAction).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole("button", { name: "Kunci pilihan" }));
    await waitFor(() => {
      expect(lockAction).toHaveBeenCalledWith("w1", "p1", { groupId: "g-edit", intent: "LOCK" });
    });
    expect(showToast).toHaveBeenCalledWith({ tone: "success", title: "Foto edit dikunci" });
    expect(refresh).toHaveBeenCalled();
  });

  it("AC-SEL-011 closes an open group after a separate confirm that names the places taken", async () => {
    const lockAction = vi.fn(ok);
    renderScreen(lockAction);
    await userEvent.click(screen.getByRole("button", { name: "Tutup pilihan" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Tutup pilihan Foto cetak?")).toBeTruthy();
    expect(
      within(dialog).getByText(
        "Klien belum mengirim. Grup dikunci dengan 1 lembar terpilih dan tidak bisa dibuka lagi.",
      ),
    ).toBeTruthy();
    await userEvent.click(within(dialog).getByRole("button", { name: "Tutup pilihan" }));
    await waitFor(() => {
      expect(lockAction).toHaveBeenCalledWith("w1", "p1", { groupId: "g-print", intent: "CLOSE" });
    });
  });

  it("AC-SEL-011 says so and re-renders when the group changed meanwhile", async () => {
    const stale: LockSelectionAction = vi.fn(() =>
      Promise.resolve({ ok: false as const, code: "INVALID_STATE" as const }),
    );
    renderScreen(stale);
    await userEvent.click(screen.getByRole("button", { name: "Kunci pilihan" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Kunci pilihan" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        tone: "warning",
        title: "Status pilihan sudah berubah. Halaman dimuat ulang.",
      });
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("A-34 shows a waiting notice while nothing was sent", () => {
    renderScreen(ok, {
      ...PAGE,
      state: "OPEN",
      groups: PAGE.groups.map((g) => ({ ...g, status: "OPEN" as const, submittedAt: null })),
    });
    expect(screen.getByText("Menunggu klien memilih")).toBeTruthy();
    expect(screen.queryByText(/sudah dikirim klien/)).toBeNull();
  });

  it("A-34 explains when the package has no selection items or the gallery isn't published", () => {
    renderScreen(ok, { ...PAGE, state: "NO_ITEMS", groups: [] });
    expect(screen.getByText("Paket proyek ini tidak punya item pilihan foto.")).toBeTruthy();
  });
});
