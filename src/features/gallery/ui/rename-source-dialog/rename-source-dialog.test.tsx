import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { copyTranslator } from "@tests/support/copy/copy-messages";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import type { SourceValidationFailure } from "../../application/use-cases/add-workspace-source/add-workspace-source.types";
import type { PhotoSourceItem } from "../photo-sources-screen/photo-sources-screen.types";
import { SOURCE_COPY_NAMESPACE } from "../source-copy/source-copy.copy";
import { RenameSourceDialog } from "./rename-source-dialog";

const copy = copyTranslator(SOURCE_COPY_NAMESPACE, "id");
const render = (ui: ReactElement) => renderInLocale(ui, "id");

const source: PhotoSourceItem = {
  id: "source-1",
  displayName: "Google Drive Utama",
  provider: "GOOGLE_DRIVE",
  isActive: true,
};

describe("RenameSourceDialog", () => {
  it("AC-SRC-010 submits a trimmed name and shows success feedback", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() => Promise.resolve<SourceValidationFailure | undefined>(undefined));
    const onOpenChange = vi.fn();
    render(
      <RenameSourceDialog
        isOpen
        workspaceId="ws-1"
        source={source}
        onOpenChange={onOpenChange}
        action={action}
      />,
    );

    const field = screen.getByRole("textbox", { name: copy("nameLabel") });
    await user.clear(field);
    await user.type(field, "  Arsip  ");
    await user.click(screen.getByRole("button", { name: copy("save") }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledWith("ws-1", "source-1", { displayName: "Arsip" });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("maps NAME_TAKEN and EMPTY to the name field", async () => {
    const user = userEvent.setup();
    const action = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        code: "VALIDATION_FAILED",
        fieldErrors: { displayName: "NAME_TAKEN" },
      })
      .mockResolvedValueOnce(undefined);
    render(
      <RenameSourceDialog
        isOpen
        workspaceId="ws-1"
        source={source}
        onOpenChange={vi.fn()}
        action={action}
      />,
    );

    const field = screen.getByRole("textbox", { name: copy("nameLabel") });
    await user.clear(field);
    await user.type(field, "Arsip");
    await user.click(screen.getByRole("button", { name: copy("save") }));
    expect(await screen.findByText(copy("nameErrorNameTaken"))).toBeInTheDocument();

    await user.clear(field);
    await user.click(screen.getByRole("button", { name: copy("save") }));
    expect(await screen.findByText(copy("nameErrorEmpty"))).toBeInTheDocument();
  });
});
