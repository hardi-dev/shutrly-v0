import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import type { AppLocale } from "@/shared/locale/locale.types";

import { CreateWorkspaceDialog } from "./create-workspace-dialog";

function stubMobile(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({
    matches,
    media: "(max-width: 767px)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function renderDialog(action: (formData: FormData) => Promise<void> = () => Promise.resolve()) {
  renderInLocale(<CreateWorkspaceDialog isOpen onOpenChange={vi.fn()} action={action} />, "id");
  return action;
}

function renderLocalized(locale: AppLocale) {
  renderInLocale(<CreateWorkspaceDialog isOpen onOpenChange={vi.fn()} action={vi.fn()} />, locale);
}

describe("CreateWorkspaceDialog copy", () => {
  it("AC-L10N-002 titles the desktop modal and labels its submit in English", async () => {
    stubMobile(false);
    renderLocalized("en");
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Create workspace" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create workspace" })).toHaveAttribute(
      "form",
      "create-workspace-form",
    );
    expect(screen.getByRole("textbox", { name: "Workspace name" })).toHaveAttribute(
      "placeholder",
      "e.g. Aster Family",
    );
  });

  it("AC-L10N-002 keeps the desktop submit button in the modal footer", async () => {
    stubMobile(false);
    renderDialog();
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Buat ruang kerja" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Buat ruang kerja" })).toHaveAttribute(
      "form",
      "create-workspace-form",
    );
    expect(document.querySelector("#create-workspace-form button[type=submit]")).toBeNull();
  });

  it("uses a form bottom sheet on mobile", async () => {
    stubMobile(true);
    renderDialog();
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Buat ruang kerja" })).toBeInTheDocument();
    });
    expect(
      screen.getByText("Buat ruang kerja terpisah untuk klien dan proyek merek lain."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Batal" })).toBeNull();
    expect(screen.getByRole("button", { name: "Buat ruang kerja" })).toHaveAttribute(
      "data-size",
      "lg",
    );
  });

  it("shows a client-side error and skips the action when the name is empty", async () => {
    const user = userEvent.setup();
    stubMobile(true);
    const action = vi.fn((formData: FormData) => Promise.resolve(formData).then(() => undefined));
    renderDialog(action);

    await user.click(await screen.findByRole("button", { name: "Buat ruang kerja" }));

    expect(await screen.findByText("Isi nama ruang kerja.")).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("passes a valid workspace name to the server action", async () => {
    const user = userEvent.setup();
    stubMobile(true);
    const action = vi.fn((formData: FormData) => Promise.resolve(formData).then(() => undefined));
    renderDialog(action);
    await user.type(
      await screen.findByRole("textbox", { name: "Nama ruang kerja" }),
      "Aster Family",
    );
    await user.click(screen.getByRole("button", { name: "Buat ruang kerja" }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });
    const formData = action.mock.calls[0]?.[0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("name")).toBe("Aster Family");
  });
});
