import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { SourceValidationFailure } from "../../application/use-cases/add-workspace-source/add-workspace-source.types";
import type { PhotoSourceItem } from "../photo-sources-screen/photo-sources-screen.types";
import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import { RenameSourceDialog } from "./rename-source-dialog";

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

    const field = screen.getByRole("textbox", { name: SOURCE_COPY.nameLabel });
    await user.clear(field);
    await user.type(field, "  Arsip  ");
    await user.click(screen.getByRole("button", { name: SOURCE_COPY.save }));

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

    const field = screen.getByRole("textbox", { name: SOURCE_COPY.nameLabel });
    await user.clear(field);
    await user.type(field, "Arsip");
    await user.click(screen.getByRole("button", { name: SOURCE_COPY.save }));
    expect(await screen.findByText(SOURCE_COPY.nameErrors.NAME_TAKEN)).toBeInTheDocument();

    await user.clear(field);
    await user.click(screen.getByRole("button", { name: SOURCE_COPY.save }));
    expect(await screen.findByText(SOURCE_COPY.nameErrors.EMPTY)).toBeInTheDocument();
  });
});
