// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SelectionCardView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";

import { SelectionCard } from "./selection-card";

const group = (
  name: string,
  status: "OPEN" | "SUBMITTED" | "LOCKED",
  patch: Partial<SelectionCardView["groups"][number]> = {},
) => ({
  id: name,
  name,
  unit: name === "Foto cetak" ? "lembar" : "foto",
  mode: "COUNT" as const,
  status,
  usage: 1,
  limit: 2,
  pickCount: 1,
  noteCount: 0,
  submittedAt: null,
  lockedAt: null,
  ...patch,
});

function card(patch: Partial<SelectionCardView>): SelectionCardView {
  return { projectTitle: "Wisuda Rina", state: "OPEN", groups: [], galleryExists: true, ...patch };
}

function renderCard(view: SelectionCardView) {
  render(<SelectionCard workspaceId="w1" projectId="p1" card={view} />);
}

describe("SelectionCard (card export states A–E)", () => {
  it("A: tells the Owner to publish the gallery first, with no link (the card is on the gallery page, A-34)", () => {
    renderCard(card({ state: "NOT_PUBLISHED", galleryExists: false }));
    expect(screen.getByText("Klien baru bisa memilih setelah galeri dipublikasikan.")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("B: lists each group with usage and status and links to Lihat pilihan", () => {
    renderCard(
      card({
        groups: [group("Foto edit", "OPEN", { usage: 3, limit: 8 }), group("Foto cetak", "OPEN")],
      }),
    );
    expect(screen.getByText("Pilihan per bagian paket.")).toBeTruthy();
    expect(screen.getByText("3 dari 8 foto")).toBeTruthy();
    expect(screen.getByText("1 dari 2 lembar")).toBeTruthy();
    expect(screen.getAllByText("Terbuka")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Lihat pilihan" }).getAttribute("href")).toBe(
      "/w/w1/projects/p1/gallery/pilihan",
    );
  });

  it("C: asks to review when a group was sent, with notes and the sent date", () => {
    renderCard(
      card({
        state: "REVIEW",
        groups: [
          group("Foto edit", "SUBMITTED", {
            usage: 8,
            limit: 8,
            noteCount: 3,
            submittedAt: "2026-10-05T07:20:00.000Z",
          }),
          group("Foto cetak", "OPEN"),
        ],
      }),
    );
    expect(screen.getByText("Klien sudah mengirim satu bagian.")).toBeTruthy();
    expect(screen.getByText("8 dari 8 foto · 3 catatan · dikirim 5 Okt 2026")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Tinjau pilihan" })).toBeTruthy();
  });

  it("D: says the picks are final once every group is locked", () => {
    renderCard(card({ state: "FINAL", groups: [group("Foto edit", "LOCKED")] }));
    expect(screen.getByText("Pilihan sudah final.")).toBeTruthy();
    expect(screen.getByText("Dikunci")).toBeTruthy();
  });

  it("E: explains that the package has no selection items and offers no button", () => {
    renderCard(card({ state: "NO_ITEMS" }));
    expect(screen.getByText("Paket proyek ini tidak punya item pilihan foto.")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
