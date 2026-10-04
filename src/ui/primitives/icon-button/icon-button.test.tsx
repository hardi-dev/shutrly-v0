import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./icon-button";

describe("IconButton (C02)", () => {
  it("renders an accessible ghost button in MD and invokes its action", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<IconButton icon="x" aria-label="Tutup" onPress={onPress} />);

    const button = screen.getByRole("button", { name: "Tutup" });
    expect(button).toHaveClass("size-(--space-10)");
    await user.click(button);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("supports the compact SM size and disabled state", () => {
    render(<IconButton icon="menu" size="sm" aria-label="Menu" isDisabled />);

    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveClass("size-(--space-8)");
    expect(button).toBeDisabled();
  });

  it("renders a capped unread badge and extends the accessible name", () => {
    render(<IconButton icon="info" aria-label="Notifikasi" badgeCount={120} />);
    expect(screen.getByRole("button", { name: "Notifikasi, 99 belum dibaca" })).toBeInTheDocument();
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("AC-PRJ-028 names the filter button with its count and badge label", () => {
    render(<IconButton icon="list-filter" aria-label="Filter" badgeCount={2} badgeLabel="aktif" />);
    expect(screen.getByRole("button", { name: "Filter, 2 aktif" })).toBeInTheDocument();
  });

  it("AC-TEAM-014 tints the icon with the danger status token for destructive row actions", () => {
    render(<IconButton icon="trash-2" tone="danger" aria-label="Hapus dari sesi" />);
    expect(screen.getByRole("button", { name: "Hapus dari sesi" })).toHaveClass(
      "text-(--color-semantic-status-danger-fg)",
    );
  });

  it("keeps the default icon colour without a tone", () => {
    render(<IconButton icon="menu" aria-label="Menu" />);
    expect(screen.getByRole("button", { name: "Menu" })).toHaveClass(
      "text-(--component-icon-button-icon)",
    );
  });

  it("AC-GAL-031 renders as a labelled link opening a new tab", () => {
    render(
      <IconButton
        icon="external-link"
        aria-label="Buka di Drive"
        href="https://drive.google.com/file/d/x/view"
        target="_blank"
      />,
    );
    const link = screen.getByRole("link", { name: "Buka di Drive" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
