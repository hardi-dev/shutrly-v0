import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateGalleryDialog } from "./create-gallery-dialog";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const DRIVE = { id: "66666666-6666-4666-8666-666666666666", name: "Google Drive" };
const RINA = "https://drive.google.com/drive/folders/fixtureRinaWisuda01";

function renderDialog(overrides: Record<string, unknown> = {}) {
  const props = {
    isOpen: true,
    onOpenChange: vi.fn(),
    workspaceId: "ws-1",
    projectId: "p-1",
    initialPassword: "mawar-4821",
    createAction: vi.fn(() =>
      Promise.resolve({ ok: true as const, galleryId: "g-1", sourceId: null }),
    ),
    proposeAction: vi.fn(() => Promise.resolve("melati-2345")),
    checkFolderAction: vi.fn(() => Promise.resolve({ ok: true as const, projectTitles: [] })),
    linkableSources: [] as (typeof DRIVE)[],
    onCreated: vi.fn(),
    ...overrides,
  };
  render(<CreateGalleryDialog {...props} />);
  return props;
}

describe("CreateGalleryDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubViewport(false);
  });

  it("AC-GAL-001 Buat ulang replaces the proposal", async () => {
    const props = renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Buat ulang" }));
    expect(props.proposeAction).toHaveBeenCalledWith("ws-1", "p-1");
    await waitFor(() => {
      expect(screen.getByLabelText("Password galeri")).toHaveValue("melati-2345");
    });
  });

  it("AC-GAL-002 shows a field error for 5 characters and creates nothing", async () => {
    const props = renderDialog();
    const field = screen.getByLabelText("Password galeri");
    await userEvent.clear(field);
    await userEvent.type(field, "abc12");
    await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
    expect(await screen.findByText("Password minimal 6 karakter.")).toBeInTheDocument();
    expect(props.createAction).not.toHaveBeenCalled();
  });

  it("AC-GAL-018 sends a duration of days", async () => {
    const props = renderDialog();
    await userEvent.click(screen.getByText("Selama beberapa hari"));
    expect(screen.getByLabelText("Jumlah hari")).toHaveValue("30");
    await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
    await waitFor(() => {
      expect(props.createAction).toHaveBeenCalledWith("ws-1", "p-1", {
        password: "mawar-4821",
        expiry: { type: "DAYS", days: 30 },
      });
    });
    expect(props.onCreated).toHaveBeenCalledWith("g-1", null);
  });

  it("AC-GAL-002 shows the server's field error on the password", async () => {
    const props = renderDialog();
    props.createAction.mockResolvedValueOnce({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { password: "TOO_SHORT" },
    } as never);
    await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
    expect(await screen.findByText("Password minimal 6 karakter.")).toBeInTheDocument();
    expect(props.onCreated).not.toHaveBeenCalled();
  });

  describe("Revision OT #3 the optional first folder", () => {
    it("AC-GAL-001 sends no folder when the link stays empty", async () => {
      const props = renderDialog({ linkableSources: [DRIVE] });
      expect(screen.getByText("Folder Google Drive")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
      await waitFor(() => {
        expect(props.createAction).toHaveBeenCalledWith("ws-1", "p-1", {
          password: "mawar-4821",
          expiry: { type: "NONE" },
        });
      });
      expect(props.checkFolderAction).not.toHaveBeenCalled();
      expect(props.onCreated).toHaveBeenCalledWith("g-1", null);
    });

    it("AC-GAL-001 creates with the folder and hands its id on to sync", async () => {
      const createAction = vi.fn(() =>
        Promise.resolve({ ok: true as const, galleryId: "g-1", sourceId: "s-1" }),
      );
      const props = renderDialog({ linkableSources: [DRIVE], createAction });
      await userEvent.type(screen.getByLabelText(/^Link folder Google Drive/), RINA);
      await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
      await waitFor(() => {
        expect(createAction).toHaveBeenCalledWith("ws-1", "p-1", {
          password: "mawar-4821",
          expiry: { type: "NONE" },
          folder: { workspaceSourceId: DRIVE.id, link: RINA, label: "" },
        });
      });
      expect(props.checkFolderAction).toHaveBeenCalledWith("ws-1", RINA);
      expect(props.onCreated).toHaveBeenCalledWith("g-1", "s-1");
    });

    it("AC-GAL-010 asks first when another project uses the folder", async () => {
      const checkFolderAction = vi.fn(() =>
        Promise.resolve({ ok: true as const, projectTitles: ["Wisuda Sari"] }),
      );
      const props = renderDialog({ linkableSources: [DRIVE], checkFolderAction });
      await userEvent.type(screen.getByLabelText(/^Link folder Google Drive/), RINA);
      await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
      expect(await screen.findByText(/Wisuda Sari/)).toBeInTheDocument();
      expect(props.createAction).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole("button", { name: "Tetap buat galeri" }));
      await waitFor(() => {
        expect(props.createAction).toHaveBeenCalledTimes(1);
      });
    });

    it("AC-GAL-009 shows the server's folder error on the link and creates nothing", async () => {
      const checkFolderAction = vi.fn(() =>
        Promise.resolve({
          ok: false as const,
          code: "VALIDATION_FAILED" as const,
          fieldErrors: { link: "NOT_A_FOLDER" as const },
        }),
      );
      const props = renderDialog({ linkableSources: [DRIVE], checkFolderAction });
      await userEvent.type(
        screen.getByLabelText(/^Link folder Google Drive/),
        "https://drive.google.com/file/d/abc/view",
      );
      await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
      await waitFor(() => {
        expect(checkFolderAction).toHaveBeenCalled();
      });
      expect(props.createAction).not.toHaveBeenCalled();
    });

    it("hides the section when the workspace has no active source", () => {
      renderDialog();
      expect(screen.queryByText("Folder Google Drive")).not.toBeInTheDocument();
    });
  });
});
