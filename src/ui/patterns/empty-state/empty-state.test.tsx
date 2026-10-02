import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders the export-aligned empty state content and optional action", () => {
    render(
      <EmptyState
        icon="camera"
        title="Workspace ini masih kosong"
        body="Mulai dengan melengkapi branding workspace."
        action={<button type="button">Lengkapi branding</button>}
      />,
    );

    expect(screen.getByTestId("empty-state")).toHaveClass(
      "bg-(--color-semantic-surface-subtle)",
      "p-(--space-12)",
    );
    expect(screen.getByTestId("empty-state-icon-wrap")).toHaveClass(
      "size-(--space-12)",
      "bg-(--color-semantic-accent-soft)",
    );
    expect(screen.getByRole("heading", { name: "Workspace ini masih kosong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lengkapi branding" })).toBeInTheDocument();
  });

  it.each([
    [
      "primary",
      "bg-(--color-semantic-action-primary)",
      "text-(--color-semantic-action-on-primary)",
    ],
    [
      "danger",
      "bg-(--color-semantic-status-danger-bg)",
      "text-(--color-semantic-status-danger-fg)",
    ],
  ] as const)("supports the %s icon tone", (iconTone, background, foreground) => {
    render(
      <EmptyState
        icon="circle-alert"
        iconTone={iconTone}
        title="Tidak ada data"
        body="Coba lagi dengan filter lain."
      />,
    );

    expect(screen.getByTestId("empty-state-icon-wrap")).toHaveClass(background);
    expect(screen.getByTestId("empty-state-icon")).toHaveClass(foreground);
  });

  it("renders without its own surface inside a card", () => {
    render(
      <EmptyState
        icon="camera"
        placement="in-card"
        title="Belum ada layanan"
        body="Tambahkan layanan untuk memulai."
      />,
    );

    const emptyState = screen.getByTestId("empty-state");
    expect(emptyState).toHaveClass("px-0", "py-(--component-empty-state-in-card-padding-y)");
    expect(emptyState).not.toHaveClass("border", "bg-(--color-semantic-surface-subtle)");
    expect(emptyState.querySelector("p")).toHaveClass("w-full");
  });
});
