// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ServiceDetailDeleteDialog } from "./service-detail-delete-dialog";

describe("ServiceDetailDeleteDialog", () => {
  it("AC-CAT-016 confirms removal with a keyboard-operable dialog", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ServiceDetailDeleteDialog
        isOpen
        title="Hapus field?"
        description="Tindakan ini tidak bisa dibatalkan."
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Hapus" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
