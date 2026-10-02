import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));

import { ServiceDetailRowActions } from "./service-detail-row-actions";

describe("ServiceDetailRowActions", () => {
  it("AC-CAT-016 exposes edit, reorder and remove actions", async () => {
    const user = userEvent.setup();
    render(
      <ServiceDetailRowActions
        kind="item"
        name="Foto cetak"
        canMoveUp
        canMoveDown={false}
        onEdit={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Aksi untuk Foto cetak" }));
    expect(screen.getByRole("menuitem", { name: "Ubah nilai" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Naikkan" })).toBeEnabled();
    expect(screen.getByRole("menuitem", { name: "Turunkan" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("menuitem", { name: "Hapus dari layanan" })).toBeInTheDocument();
  });
});
