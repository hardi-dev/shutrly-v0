import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CreateWorkspaceDialog } from "./create-workspace-dialog";

describe("CreateWorkspaceDialog", () => {
  it("keeps the desktop submit button in the modal footer", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      media: "(max-width: 767px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <CreateWorkspaceDialog
        isOpen
        onOpenChange={vi.fn()}
        action={vi.fn(() => Promise.resolve())}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Buat workspace" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Buat workspace" })).toHaveAttribute(
      "form",
      "create-workspace-form",
    );
    expect(document.querySelector("#create-workspace-form button[type=submit]")).toBeNull();
  });

  it("uses a form bottom sheet on mobile", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      media: "(max-width: 767px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <CreateWorkspaceDialog
        isOpen
        onOpenChange={vi.fn()}
        action={vi.fn(() => Promise.resolve())}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Buat workspace" })).toBeInTheDocument();
    });
    expect(
      screen.getByText("Satu workspace untuk satu brand. Klien, proyek, dan invoice-nya terpisah."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Batal" })).toBeNull();
    expect(screen.getByRole("button", { name: "Buat workspace" })).toHaveAttribute(
      "data-size",
      "lg",
    );
  });

  it("shows a client-side error and skips the action when the name is empty", async () => {
    const user = userEvent.setup();
    const action = vi.fn((formData: FormData) => Promise.resolve(formData).then(() => undefined));
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      media: "(max-width: 767px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<CreateWorkspaceDialog isOpen onOpenChange={vi.fn()} action={action} />);

    await user.click(await screen.findByRole("button", { name: "Buat workspace" }));

    expect(await screen.findByText("Nama workspace wajib diisi.")).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("passes a valid workspace name to the server action", async () => {
    const user = userEvent.setup();
    const action = vi.fn((formData: FormData) => Promise.resolve(formData).then(() => undefined));
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      media: "(max-width: 767px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<CreateWorkspaceDialog isOpen onOpenChange={vi.fn()} action={action} />);
    await user.type(await screen.findByRole("textbox", { name: "Nama workspace" }), "Aster Family");
    await user.click(screen.getByRole("button", { name: "Buat workspace" }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });
    const formData = action.mock.calls[0]?.[0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("name")).toBe("Aster Family");
  });
});
