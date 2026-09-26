import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EditorialPanel } from "./editorial-panel";
import { EDITORIAL_PANEL_COPY } from "./editorial-panel.copy";

describe("EditorialPanel (Z5xhk)", () => {
  it("AC-AUTH-023 is decorative: hidden from assistive technology, with no controls", () => {
    const { container } = render(<EditorialPanel />);
    const panel = container.querySelector("aside");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel?.querySelectorAll("a, button, input")).toHaveLength(0);
    expect(panel?.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("AC-AUTH-023 keeps the headline as text", () => {
    const { container } = render(<EditorialPanel />);
    expect(container.textContent).toContain(EDITORIAL_PANEL_COPY.body);
  });
});
