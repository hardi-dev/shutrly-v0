import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LinkSourceDialog } from "./link-source-dialog";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const SOURCE_ID = "66666666-6666-4666-8666-666666666666";
const LINK = "https://drive.google.com/drive/folders/1RinaWisudaFolder";

function renderDialog(projectTitles: string[] = []) {
  const props = {
    isOpen: true,
    onOpenChange: vi.fn(),
    workspaceId: "ws-1",
    galleryId: "g-1",
    linkableSources: [{ id: SOURCE_ID, name: "Google Drive" }],
    checkFolderAction: vi.fn(() => Promise.resolve({ ok: true as const, projectTitles })),
    linkSourceAction: vi.fn(() => Promise.resolve({ ok: true as const, sourceId: "s-1" })),
    onLinked: vi.fn(),
  };
  render(<LinkSourceDialog {...props} />);
  return props;
}

describe("LinkSourceDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubViewport(false);
  });

  it("AC-GAL-005 warns about public links and links the folder", async () => {
    const props = renderDialog();
    expect(screen.getByText("Link Drive melewati password galeri")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Link folder Google Drive"), LINK);
    await userEvent.click(screen.getByRole("button", { name: "Tambah folder" }));
    await waitFor(() => {
      expect(props.linkSourceAction).toHaveBeenCalledWith("ws-1", "g-1", {
        workspaceSourceId: SOURCE_ID,
        link: LINK,
        label: "",
      });
    });
    expect(props.onLinked).toHaveBeenCalledWith("s-1");
  });

  it("AC-GAL-009 shows the file-link error from the server", async () => {
    const props = renderDialog();
    props.checkFolderAction.mockResolvedValueOnce({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { link: "NOT_A_FOLDER" },
    } as never);
    await userEvent.type(
      screen.getByLabelText("Link folder Google Drive"),
      "https://drive.google.com/file/d/1aB9xQ/view",
    );
    await userEvent.click(screen.getByRole("button", { name: "Tambah folder" }));
    expect(
      await screen.findByText("Ini link file. Tempel link folder Google Drive."),
    ).toBeInTheDocument();
    expect(props.linkSourceAction).not.toHaveBeenCalled();
  });

  it("AC-GAL-010 warns with the other project before linking", async () => {
    const props = renderDialog(["Wisuda Basic — Sari"]);
    await userEvent.type(screen.getByLabelText("Link folder Google Drive"), LINK);
    await userEvent.click(screen.getByRole("button", { name: "Tambah folder" }));
    expect(await screen.findByText(/Wisuda Basic — Sari/)).toBeInTheDocument();
    expect(props.linkSourceAction).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Tetap tambahkan" }));
    await waitFor(() => {
      expect(props.linkSourceAction).toHaveBeenCalled();
    });
  });
});
