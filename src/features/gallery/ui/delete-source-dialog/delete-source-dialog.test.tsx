import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { showToast } from "@/ui/patterns/toast/toast";

import { SOURCE_COPY } from "../source-copy/source-copy.copy";
import { DeleteSourceDialog } from "./delete-source-dialog";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const source = {
  id: "source-1",
  displayName: "Arsip 2024",
  provider: "GOOGLE_DRIVE" as const,
  isActive: true,
};

describe("DeleteSourceDialog", () => {
  it("AC-SRC-012 confirms deletion and shows success feedback", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() => Promise.resolve({ ok: true as const }));
    const onOpenChange = vi.fn();
    render(
      <DeleteSourceDialog
        isOpen
        workspaceId="ws-1"
        source={source}
        onOpenChange={onOpenChange}
        action={action}
      />,
    );

    expect(
      screen.getByRole("alertdialog", { name: SOURCE_COPY.deleteTitle(source.displayName) }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: SOURCE_COPY.deleteConfirm }));
    await waitFor(() => {
      expect(action).toHaveBeenCalledWith("ws-1", "source-1");
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(showToast).toHaveBeenCalledWith({
      tone: "success",
      title: SOURCE_COPY.deletedTitle,
      body: SOURCE_COPY.deletedBody(source.displayName),
    });
  });

  it("AC-SRC-013 keeps the dialog open and shows IN_USE feedback", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() => Promise.resolve({ ok: false as const, code: "IN_USE" as const }));
    const onOpenChange = vi.fn();
    render(
      <DeleteSourceDialog
        isOpen
        workspaceId="ws-1"
        source={source}
        onOpenChange={onOpenChange}
        action={action}
      />,
    );
    await user.click(screen.getByRole("button", { name: SOURCE_COPY.deleteConfirm }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({ tone: "danger", title: SOURCE_COPY.inUse });
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
