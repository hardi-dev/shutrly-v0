// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FinishProjectButton } from "./finish-project-button";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

type CompleteAction = (workspaceId: string, projectId: string) => Promise<unknown>;

function renderButton(completeAction = vi.fn<CompleteAction>(() => Promise.resolve(undefined))) {
  const actions = { completeAction };
  render(
    <FinishProjectButton workspaceId="w1" projectId="p1" title="Wisuda Rina" actions={actions} />,
  );
  return actions;
}

describe("FinishProjectButton (BR-PRJ-004, DELIVERED to COMPLETED)", () => {
  it("opens the confirm with the original Tandai selesai wording", async () => {
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Tandai selesai" }));
    expect(await screen.findByText("Tandai proyek selesai?")).toBeTruthy();
    expect(screen.getByText("Proyek Wisuda Rina akan berstatus Selesai.")).toBeTruthy();
  });

  it("confirms, completes the project and toasts the original success text", async () => {
    const actions = renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Tandai selesai" }));
    fireEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Tandai selesai" }),
    );
    await vi.waitFor(() => {
      expect(actions.completeAction).toHaveBeenCalledWith("w1", "p1");
    });
    expect(showToast).toHaveBeenCalledWith({ tone: "success", title: "Proyek ditandai selesai" });
  });

  it("a stale status shows the reload toast instead of success", async () => {
    const actions = renderButton(vi.fn<CompleteAction>(() => Promise.resolve({ ok: false })));
    fireEvent.click(screen.getByRole("button", { name: "Tandai selesai" }));
    fireEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Tandai selesai" }),
    );
    await vi.waitFor(() => {
      expect(actions.completeAction).toHaveBeenCalled();
    });
    expect(showToast).toHaveBeenCalledWith({
      tone: "danger",
      title: "Status proyek sudah berubah. Muat ulang halaman.",
    });
  });
});
