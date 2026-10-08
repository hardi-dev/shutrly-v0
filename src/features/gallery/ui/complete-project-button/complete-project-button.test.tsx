// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";

import { CompleteProjectButton } from "./complete-project-button";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

const DELIVERED: DeliveryCardView = {
  state: "PUBLISHED",
  projectTitle: "Wisuda Rina",
  editedCount: 2,
  printCount: 1,
  items: [
    { id: "i-edit", name: "Foto edit", count: 2 },
    { id: "i-print", name: "Foto cetak", count: 1 },
  ],
  publishedAt: "2026-10-05T03:00:00Z",
  completedAt: null,
  canComplete: true,
  isShown: true,
};

describe("CompleteProjectButton (owner-7 header action)", () => {
  it("AC-DEL-007 confirms, then completes the delivered project", async () => {
    const actions = {
      publishAction: vi.fn(() => Promise.resolve(undefined)),
      completeAction: vi.fn(() => Promise.resolve(undefined)),
    };
    render(
      <CompleteProjectButton workspaceId="w1" projectId="p1" card={DELIVERED} actions={actions} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Tandai selesai" }));
    expect(await screen.findByText("Proyek Wisuda Rina akan berstatus Selesai.")).toBeTruthy();
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Tandai selesai" }),
    );
    await vi.waitFor(() => {
      expect(actions.completeAction).toHaveBeenCalledWith("w1", "p1");
    });
    expect(showToast).toHaveBeenCalledWith({ tone: "success", title: "Proyek ditandai selesai" });
  });
});
