// @vitest-environment jsdom

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SelectionGroupDetailView } from "@/features/gallery/application/use-cases/get-selection-group-detail/get-selection-group-detail.types";
import { showToast } from "@/ui/patterns/toast/toast";

import type { LockSelectionAction } from "../use-lock-selection/use-lock-selection.types";
import { SelectionGroupScreen } from "./selection-group-screen";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const pick = (name: string, patch: Partial<SelectionGroupDetailView["picks"][number]> = {}) => ({
  photoId: `id-${name}`,
  fileName: `${name}.jpg`,
  folderPath: "Rina-Wisuda/Akad",
  quantity: 1,
  note: null,
  missing: false,
  ...patch,
});

function detail(patch: Partial<SelectionGroupDetailView> = {}): SelectionGroupDetailView {
  return {
    projectTitle: "Wisuda Rina",
    group: {
      id: "g-edit",
      name: "Foto edit",
      unit: "foto",
      mode: "COUNT",
      status: "SUBMITTED",
      usage: 2,
      limit: 8,
      pickCount: 2,
      noteCount: 1,
      // 07:20 UTC is 14.20 in Jakarta.
      submittedAt: "2026-10-05T07:20:00.000Z",
      lockedAt: null,
    },
    picks: [pick("IMG_001"), pick("IMG_002", { note: "hapus jerawat\ncerahkan sedikit" })],
    changedAt: "2026-10-05T06:52:00.000Z",
    missingCount: 0,
    missingNames: [],
    ...patch,
  };
}

const lockOk: LockSelectionAction = vi.fn(() =>
  Promise.resolve({ ok: true as const, groupName: "Foto edit" }),
);

function renderScreen(view: SelectionGroupDetailView, lockAction: LockSelectionAction = lockOk) {
  render(
    <SelectionGroupScreen workspaceId="w1" projectId="p1" detail={view} lockAction={lockAction} />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SelectionGroupScreen (owner-2 exports)", () => {
  it("AC-SEL-010 shows the summary, each pick with its folder, and the client's note", () => {
    renderScreen(detail());
    expect(screen.getByText("Ringkasan")).toBeTruthy();
    expect(screen.getByText("2 dari 8 foto")).toBeTruthy();
    expect(screen.getByText("Dikirim 5 Okt 2026, 14.20")).toBeTruthy();
    expect(screen.getByText("1 foto bercatatan")).toBeTruthy();
    expect(screen.getByText("2 foto · 1 dengan catatan")).toBeTruthy();
    expect(screen.getAllByText("Rina-Wisuda › Akad")).toHaveLength(2);
    expect(screen.getByText("Catatan klien")).toBeTruthy();
    expect(screen.getByText(/hapus jerawat/)).toBeTruthy();
  });

  it("AC-SEL-010 copies the file names with notes on one line each, and says so", async () => {
    const user = userEvent.setup();
    renderScreen(detail());
    await user.click(screen.getByRole("button", { name: "Salin nama file" }));
    expect(await navigator.clipboard.readText()).toBe(
      "IMG_001.jpg\nIMG_002.jpg — hapus jerawat cerahkan sedikit",
    );
    expect(showToast).toHaveBeenCalledWith({ tone: "success", title: "Daftar nama file disalin" });
  });

  it("AC-SEL-010 copies print quantities as × n", async () => {
    const user = userEvent.setup();
    const view = detail();
    renderScreen({
      ...view,
      group: { ...view.group, mode: "QUANTITY", unit: "lembar", usage: 2 },
      picks: [pick("IMG_003", { quantity: 2 })],
    });
    expect(screen.getByText("1 foto · jumlah cetak tertulis di tiap foto")).toBeTruthy();
    expect(screen.getByText("× 2")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Salin nama file" }));
    expect(await navigator.clipboard.readText()).toBe("IMG_003.jpg × 2");
  });

  it("AC-SEL-015 flags a missing photo, names it in the alert, and keeps it counted", () => {
    const view = detail({
      picks: [pick("IMG_010", { missing: true })],
      missingCount: 1,
      missingNames: ["IMG_010.jpg"],
    });
    renderScreen(view);
    expect(screen.getByText("1 foto pilihan tidak ada lagi di Drive")).toBeTruthy();
    expect(
      screen.getByText("IMG_010.jpg tetap dihitung. Cari filenya di Drive atau kunci apa adanya."),
    ).toBeTruthy();
    expect(screen.getByText("Hilang")).toBeTruthy();
    expect(screen.getByText("2 dari 8 foto")).toBeTruthy();
  });

  it("AC-SEL-011 locks a sent group after the confirm, and offers no Tutup pilihan for it", async () => {
    const lockAction = vi.fn(lockOk);
    renderScreen(detail(), lockAction);
    expect(screen.queryByRole("button", { name: "Tutup pilihan" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Kunci pilihan" }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(
        "Setelah dikunci, pilihan tidak bisa dibuka lagi dan add-on tidak bisa menambah batas grup ini.",
      ),
    ).toBeTruthy();
    await userEvent.click(within(dialog).getByRole("button", { name: "Kunci pilihan" }));
    await waitFor(() => {
      expect(lockAction).toHaveBeenCalledWith("w1", "p1", { groupId: "g-edit", intent: "LOCK" });
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("AC-SEL-011 for an open group warns the client can still change and offers Tutup pilihan", () => {
    const view = detail();
    renderScreen({
      ...view,
      group: { ...view.group, status: "OPEN", submittedAt: null },
    });
    expect(screen.getByText("Klien masih bisa mengubah pilihan")).toBeTruthy();
    expect(screen.getByText("Diubah 5 Okt 2026, 13.52")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tutup pilihan" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Kunci pilihan" })).toBeNull();
  });

  it("AC-SEL-011 shows when it was locked and offers no lock actions afterwards", () => {
    const view = detail();
    renderScreen({
      ...view,
      group: { ...view.group, status: "LOCKED", lockedAt: "2026-10-05T09:05:00.000Z" },
    });
    expect(screen.getByText("Dikunci 5 Okt 2026, 16.05")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Kunci pilihan" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Tutup pilihan" })).toBeNull();
    expect(screen.getByRole("button", { name: "Salin nama file" })).toBeTruthy();
  });

  it("A-34 shows an empty state and disables copying for a group with no picks", () => {
    renderScreen(detail({ picks: [], changedAt: null }));
    expect(screen.getByText("Belum ada foto dipilih")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Salin nama file" }).hasAttribute("disabled")).toBe(
      true,
    );
  });
});
