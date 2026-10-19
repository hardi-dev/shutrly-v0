// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";

import { MarkDeliveredButton } from "./mark-delivered-button";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

const POST_PROCESSING: DeliveryCardView = {
  state: "READY",
  projectTitle: "Wisuda Rina",
  editedCount: 2,
  printCount: 1,
  items: [
    { id: "i-edit", name: "Foto edit", count: 2 },
    { id: "i-print", name: "Foto cetak", count: 1 },
  ],
  publishedAt: null,
  completedAt: null,
  canComplete: false,
  isShown: true,
};

function renderButton(card: DeliveryCardView, markDeliveredAction = vi.fn()) {
  const actions = { markDeliveredAction };
  render(<MarkDeliveredButton workspaceId="w1" projectId="p1" card={card} actions={actions} />);
  return actions;
}

describe("MarkDeliveredButton (AC-GFL-017, project header step)", () => {
  it("AC-GFL-017 stays disabled with a hint while no finished file is synced", () => {
    renderButton({ ...POST_PROCESSING, editedCount: 0, printCount: 0, items: [] });
    expect(screen.getByRole("button", { name: "Tandai terkirim" })).toBeDisabled();
    expect(
      screen.getByText(
        "Belum ada hasil akhir yang tersinkron. Sinkronkan folder hasil akhir dulu.",
      ),
    ).toBeTruthy();
  });

  it("AC-GFL-017 confirms, then marks the project delivered", async () => {
    const actions = renderButton(
      POST_PROCESSING,
      vi.fn(() => Promise.resolve(undefined)),
    );
    fireEvent.click(screen.getByRole("button", { name: "Tandai terkirim" }));
    expect(await screen.findByText("Proyek Wisuda Rina akan berstatus Terkirim.")).toBeTruthy();
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Tandai terkirim" }),
    );
    await vi.waitFor(() => {
      expect(actions.markDeliveredAction).toHaveBeenCalledWith("w1", "p1");
    });
    expect(showToast).toHaveBeenCalledWith({ tone: "success", title: "Proyek ditandai terkirim" });
  });

  it("A-6 a refused write names the missing finished file", async () => {
    renderButton(
      POST_PROCESSING,
      vi.fn(() =>
        Promise.resolve({
          ok: false as const,
          code: "REFUSED" as const,
          reasons: ["NO_FINISHED_FILE" as const],
        }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Tandai terkirim" }));
    fireEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Tandai terkirim" }),
    );
    await vi.waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        tone: "danger",
        title: "Proyek belum bisa ditandai terkirim",
        body: "Belum ada hasil akhir yang tersinkron.",
      });
    });
  });
});
