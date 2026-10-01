import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { showToast } from "@/ui/patterns/toast/toast";

import type { AddSourceInput } from "../../application/schemas/add-source/add-source.types";
import type { SourceValidationFailure } from "../../application/use-cases/add-workspace-source/add-workspace-source.types";
import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import { AddSourceDialog } from "./add-source-dialog";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const actionResult = (): Promise<SourceValidationFailure | undefined> => Promise.resolve(undefined);

function renderDialog(
  action: (
    workspaceId: string,
    values: AddSourceInput,
  ) => Promise<SourceValidationFailure | undefined> = vi.fn(actionResult),
) {
  return render(
    <AddSourceDialog isOpen workspaceId="ws-1" onOpenChange={vi.fn()} action={action} />,
  );
}

describe("AddSourceDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  it("AC-SRC-006 submits a Google Drive source and shows success feedback", async () => {
    const user = userEvent.setup();
    const action = vi.fn(actionResult);
    const onOpenChange = vi.fn();
    render(
      <AddSourceDialog isOpen workspaceId="ws-1" onOpenChange={onOpenChange} action={action} />,
    );

    await user.type(
      screen.getByRole("textbox", { name: SOURCE_COPY.nameLabel }),
      "Google Drive Arsip",
    );
    await user.click(screen.getByRole("button", { name: SOURCE_COPY.add }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith("ws-1", {
        provider: "GOOGLE_DRIVE",
        displayName: "Google Drive Arsip",
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(showToast).toHaveBeenCalledWith({
      tone: "success",
      title: SOURCE_COPY.addedTitle,
      body: SOURCE_COPY.addedBody("Google Drive Arsip"),
    });
  });

  it("AC-SRC-007 disables providers that are not available yet", () => {
    renderDialog();
    expect(screen.getByRole("radio", { name: /Dropbox.*Segera hadir/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /OneDrive.*Segera hadir/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /Amazon S3.*Segera hadir/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /Custom URL.*Segera hadir/ })).toBeDisabled();
  });

  it("AC-SRC-008 validates an empty source name before calling the action", async () => {
    const user = userEvent.setup();
    const action = vi.fn(actionResult);
    renderDialog(action);

    await user.click(screen.getByRole("button", { name: SOURCE_COPY.add }));

    expect(await screen.findByText(SOURCE_COPY.nameErrors.EMPTY)).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("AC-SRC-009 maps NAME_TAKEN to the name field", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() =>
      Promise.resolve<SourceValidationFailure>({
        ok: false,
        code: "VALIDATION_FAILED",
        fieldErrors: { displayName: "NAME_TAKEN" },
      }),
    );
    renderDialog(action);

    await user.type(screen.getByRole("textbox", { name: SOURCE_COPY.nameLabel }), "Arsip");
    await user.click(screen.getByRole("button", { name: SOURCE_COPY.add }));

    expect(await screen.findByText(SOURCE_COPY.nameErrors.NAME_TAKEN)).toBeInTheDocument();
  });

  it("AC-SRC-014 keeps the dialog open and retries after a rejected action", async () => {
    const user = userEvent.setup();
    const action = vi.fn().mockRejectedValue(new Error("network"));
    renderDialog(action);

    await user.type(screen.getByRole("textbox", { name: SOURCE_COPY.nameLabel }), "Arsip");
    await user.click(screen.getByRole("button", { name: SOURCE_COPY.add }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ tone: "danger" }));
    });
    expect(screen.getByRole("dialog", { name: SOURCE_COPY.addTitle })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: SOURCE_COPY.nameLabel })).toHaveValue("Arsip");

    const toast = vi.mocked(showToast).mock.calls.at(-1)?.[0];
    toast?.action?.onAction();
    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(2);
    });
  });

  it("marks the submit button pending while the action is unresolved", async () => {
    const user = userEvent.setup();
    let resolveAction: (() => void) | undefined;
    const action = vi.fn(
      () =>
        new Promise<undefined>((resolve) => {
          resolveAction = () => {
            resolve(undefined);
          };
        }),
    );
    renderDialog(action);

    await user.type(screen.getByRole("textbox", { name: SOURCE_COPY.nameLabel }), "Arsip");
    const submit = screen.getByRole("button", { name: SOURCE_COPY.add });
    await user.click(submit);

    expect(await screen.findByRole("button", { name: SOURCE_COPY.adding })).toHaveAttribute(
      "data-pending",
      "true",
    );
    resolveAction?.();
  });
});
