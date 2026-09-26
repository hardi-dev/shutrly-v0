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

    expect(icon).toHaveClass("size-(--space-4)");
    expect(icon).toHaveAccessibleName("Cari");
    expect(icon).not.toHaveAttribute("aria-hidden");
  });
});
