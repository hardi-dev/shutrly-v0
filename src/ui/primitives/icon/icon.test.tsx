import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "./icon";
import { ICON_NAMES } from "./icon.registry";

describe("Icon", () => {
  it("renders every registered semantic name as a decorative SVG", () => {
    render(
      <>
        {ICON_NAMES.map((name) => (
          <Icon key={name} name={name} data-testid={`icon-${name}`} />
        ))}
      </>,
    );

    for (const name of ICON_NAMES) {
      expect(screen.getByTestId(`icon-${name}`)).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("uses token-backed sizes and preserves an accessible label", () => {
    render(<Icon name="search" size="md" aria-label="Cari" data-testid="search-icon" />);
    const icon = screen.getByTestId("search-icon");

    expect(icon).toHaveClass("size-(--component-icon-size-md)");
    expect(icon).toHaveAccessibleName("Cari");
    expect(icon).not.toHaveAttribute("aria-hidden");
  });

  it("registers the workspace semantic icon names", () => {
    expect(ICON_NAMES).toEqual(
      expect.arrayContaining([
        "camera",
        "chevrons-up-down",
        "layout-grid",
        "folder-kanban",
        "users",
        "receipt",
        "package",
        "user-round-cog",
        "message-square-text",
        "share-2",
        "image",
        "layers",
        "download",
        "hourglass",
        "package-check",
        "wallet",
        "rotate-ccw",
        "braces",
        "pencil",
        "settings",
        "menu",
        "check",
        "chevron-right",
        "search-x",
        "panel-left",
        "panel-left-open",
        "log-out",
        "x",
        "bell",
        "chevron-left",
        "aperture",
        "hard-drive",
        "folder-open",
        "folder",
        "power",
        "dropbox",
        "cloud",
        "database",
        "link",
        "more-horizontal",
        "printer",
        "clock",
        "book-open",
        "hash",
        "move-horizontal",
        "arrow-up",
        "arrow-down",
        "archive",
        "archive-restore",
        "lock",
        "type",
        "align-left",
        "toggle-left",
        "list",
        "user-plus",
      ]),
    );
  });
});
