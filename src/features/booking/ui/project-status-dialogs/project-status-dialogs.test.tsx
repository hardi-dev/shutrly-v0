import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CancelProjectDialog } from "./cancel-project-dialog";
import { DeleteDraftDialog } from "./delete-draft-dialog";

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

const TARGET = { id: "p1", title: "Wisuda Basic — Rina", status: "BOOKED" as const };

describe("CancelProjectDialog", () => {
  it("AC-PRJ-022 makes the reason optional in BOOKED and cancels", async () => {
    const cancelAction = vi.fn(() => Promise.resolve(undefined));
    const onDone = vi.fn();
    render(
      <CancelProjectDialog
        workspaceId="ws"
        target={TARGET}
        cancelAction={cancelAction}
        onOpenChange={vi.fn()}
        onDone={onDone}
      />,
    );
    expect(screen.getByText("Batalkan proyek?")).toBeInTheDocument();
    expect(screen.getByText("Opsional")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Batalkan proyek" }));
    expect(cancelAction).toHaveBeenCalledWith("ws", "p1", { reason: "" });
    expect(showToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Proyek dibatalkan",
      body: "Wisuda Basic — Rina pindah ke tab Dibatalkan.",
    });
    expect(onDone).toHaveBeenCalled();
  });

  it("AC-PRJ-022 requires a reason from SHOOTING and shows the server error", async () => {
    const cancelAction = vi.fn(() =>
      Promise.resolve({
        ok: false as const,
        code: "VALIDATION_FAILED" as const,
        fieldErrors: { reason: "REASON_REQUIRED" as const },
      }),
    );
    render(
      <CancelProjectDialog
        workspaceId="ws"
        target={{ ...TARGET, status: "SHOOTING" }}
        cancelAction={cancelAction}
        onOpenChange={vi.fn()}
        onDone={vi.fn()}
      />,
    );
    expect(screen.getByText("Alasan pembatalan")).toBeInTheDocument();
    expect(screen.queryByText("Opsional")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Batalkan proyek" }));
    expect(
      await screen.findByText("Isi alasan pembatalan. Wajib setelah pemotretan dimulai."),
    ).toBeInTheDocument();
  });
});

describe("DeleteDraftDialog", () => {
  it("AC-PRJ-023 confirms, toasts and hands back to the caller", async () => {
    const deleteAction = vi.fn(() => Promise.resolve({ ok: true as const, title: TARGET.title }));
    const onDone = vi.fn();
    render(
      <DeleteDraftDialog
        workspaceId="ws"
        target={{ ...TARGET, status: "DRAFT" }}
        deleteAction={deleteAction}
        onOpenChange={vi.fn()}
        onDone={onDone}
      />,
    );
    expect(screen.getByText("Hapus draf “Wisuda Basic — Rina”?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Hapus draf" }));
    expect(deleteAction).toHaveBeenCalledWith("ws", "p1");
    expect(showToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Draf dihapus",
      body: "Wisuda Basic — Rina sudah dihapus.",
    });
    expect(onDone).toHaveBeenCalled();
  });
});
