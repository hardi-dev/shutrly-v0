// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AddOnCardView } from "@/features/booking/application/use-cases/list-add-ons/list-add-ons.types";

import { AddOnCard } from "./add-on-card";
import type { AddOnCardActions } from "./add-on-card.types";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const EDIT = {
  id: "g1",
  name: "Foto edit",
  unit: "foto",
  status: "OPEN",
  limit: 8,
  usage: 7,
  isTargetable: true,
} as const;
const BASE = {
  quantity: 5,
  unitPrice: "20000",
  totalAmount: "100000",
  approvedAt: new Date("2026-10-05T03:00:00Z"),
  createdAt: new Date("2026-10-04T03:00:00Z"),
};

function card(patch: Partial<AddOnCardView> = {}): AddOnCardView {
  return { canCreate: true, addOns: [], targets: [EDIT], lockedGroupNames: [], ...patch };
}

function renderCard(view: AddOnCardView, actions: Partial<AddOnCardActions> = {}) {
  const all: AddOnCardActions = {
    createAction: vi.fn(),
    approveAction: vi.fn(() => Promise.resolve(undefined)),
    cancelAction: vi.fn(() => Promise.resolve(undefined)),
    deleteDraftAction: vi.fn(() => Promise.resolve(undefined)),
    ...actions,
  };
  render(<AddOnCard workspaceId="w1" projectId="p1" card={view} actions={all} />);
  return all;
}

describe("AddOnCard (addon-kartu states A–C)", () => {
  it("A: shows the empty note and Tambah add-on", () => {
    renderCard(card());
    expect(screen.getByText(/Belum ada add-on/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tambah add-on" })).toBeTruthy();
  });

  it("B: lists add-ons with their line and chip", () => {
    renderCard(
      card({
        addOns: [
          {
            ...BASE,
            id: "a1",
            selectionGroupId: "g1",
            description: "Tambahan 5 foto edit",
            status: "DRAFT",
            group: EDIT,
          },
          {
            ...BASE,
            id: "a2",
            selectionGroupId: null,
            description: "Album tambahan",
            quantity: 1,
            unitPrice: "750000",
            totalAmount: "750000",
            status: "APPROVED",
            group: null,
          },
        ],
      }),
    );
    expect(screen.getByText("Foto edit · 5 × Rp 20.000 = Rp 100.000")).toBeTruthy();
    expect(screen.getByText("Tanpa grup · 1 × Rp 750.000 = Rp 750.000")).toBeTruthy();
    expect(screen.getByText("Draf")).toBeTruthy();
    expect(screen.getByText("Disetujui")).toBeTruthy();
  });

  it("C: explains that a locked group can't take an add-on", () => {
    renderCard(card({ lockedGroupNames: ["Foto cetak"] }));
    expect(screen.getByText(/Foto cetak sudah dikunci/)).toBeTruthy();
  });

  it("A-11 hides Tambah add-on when the project takes none", () => {
    renderCard(card({ canCreate: false }));
    expect(screen.queryByRole("button", { name: "Tambah add-on" })).toBeNull();
  });

  it("AC-ADD-005 a cancel below usage opens the refusal with the numbers", async () => {
    const row = {
      ...BASE,
      id: "a1",
      selectionGroupId: "g1",
      description: "Tambahan 5 foto edit",
      status: "APPROVED" as const,
      group: { ...EDIT, limit: 13, usage: 11 },
    };
    const actions = renderCard(card({ addOns: [row] }), {
      cancelAction: vi.fn(() =>
        Promise.resolve({
          ok: false as const,
          code: "CANCEL_BELOW_USAGE" as const,
          usage: 11,
          limit: 8,
        }),
      ),
    });
    fireEvent.click(screen.getByRole("button", { name: "Aksi Tambahan 5 foto edit" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Batalkan add-on" }));
    fireEvent.click(await screen.findByRole("button", { name: "Batalkan add-on" }));
    await act(() => Promise.resolve());
    expect(actions.cancelAction).toHaveBeenCalledWith("w1", "p1", { addOnId: "a1" });
    expect(await screen.findByText("Add-on belum bisa dibatalkan")).toBeTruthy();
    expect(screen.getByText(/Klien sudah memilih 11 foto/)).toBeTruthy();
  });
});
