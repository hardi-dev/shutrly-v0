import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateGalleryDialog } from "./create-gallery-dialog";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

function renderDialog() {
  const props = {
    isOpen: true,
    onOpenChange: vi.fn(),
    workspaceId: "ws-1",
    projectId: "p-1",
    initialPassword: "mawar-4821",
    createAction: vi.fn(() => Promise.resolve({ ok: true as const, galleryId: "g-1" })),
    proposeAction: vi.fn(() => Promise.resolve("melati-2345")),
    onCreated: vi.fn(),
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
    expect(props.onCreated).toHaveBeenCalledWith("g-1");
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
});
