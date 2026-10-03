import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectInfoDialog } from "./project-info-dialog";
import type { UpdateProjectInfoCall } from "./project-info-dialog.types";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const TARGET = {
  projectId: "p1",
  title: "Wisuda Basic — Rina",
  notes: "Catatan",
  agreedPrice: "700000",
  basePrice: "750000",
  canEditDeal: true,
};

function renderDialog(
  overrides: Partial<typeof TARGET> = {},
  updateAction: UpdateProjectInfoCall = vi.fn(() => Promise.resolve(undefined)),
) {
  const onSaved = vi.fn();
  render(
    <ProjectInfoDialog
      isOpen
      onOpenChange={vi.fn()}
      workspaceId="ws"
      target={{ ...TARGET, ...overrides }}
      updateAction={updateAction}
      onSaved={onSaved}
    />,
  );
  return { updateAction, onSaved };
}

describe("ProjectInfoDialog", () => {
  it("AC-PRJ-017 saves the edited values and refreshes", async () => {
    const { updateAction, onSaved } = renderDialog();
    expect(screen.getByText("Harga dasar layanan: Rp 750.000")).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("Judul proyek"));
    await userEvent.type(screen.getByLabelText("Judul proyek"), "Judul baru");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(updateAction).toHaveBeenCalledWith("ws", "p1", {
      title: "Judul baru",
      agreedPrice: "700.000",
      notes: "Catatan",
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it("AC-PRJ-017 locks the price once shooting started and says so", () => {
    renderDialog({ canEditDeal: false });
    expect(screen.getByText("Judul dan catatan masih bisa diubah.")).toBeInTheDocument();
    expect(screen.getByLabelText("Harga sepakat")).toBeDisabled();
    expect(screen.getByText("Terkunci sejak pemotretan dimulai.")).toBeInTheDocument();
  });

  it("AC-PRJ-017 shows server field errors", async () => {
    const failing = vi.fn(() =>
      Promise.resolve({
        ok: false as const,
        code: "VALIDATION_FAILED" as const,
        fieldErrors: { title: "EMPTY" as const },
      }),
    );
    renderDialog({}, failing);
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByText("Isi judul proyek.")).toBeInTheDocument();
  });
});
