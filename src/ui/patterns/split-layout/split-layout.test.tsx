import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SplitLayout } from "./split-layout";
import { SPLIT_LAYOUT_COPY } from "./split-layout.copy";

describe("SplitLayout", () => {
  it("AC-AUTH-023 puts the screen in a main landmark with the brand and footer", () => {
    render(
      <SplitLayout>
        <h1>Heading</h1>
      </SplitLayout>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("Heading");
    expect(screen.getByText(SPLIT_LAYOUT_COPY.brand)).toBeInTheDocument();
    expect(screen.getByText(SPLIT_LAYOUT_COPY.footer)).toBeInTheDocument();
  });

  it("AC-AUTH-023 hides the editorial panel below the desktop breakpoint", () => {
    const { container } = render(<SplitLayout>x</SplitLayout>);
    expect(container.querySelector('[data-slot="editorial"]')).toHaveClass("hidden", "lg:block");
  });

  it("keeps the editorial headline valid inside the panel typography wrapper", () => {
    const { container } = render(<SplitLayout>Headline</SplitLayout>);
    expect(container.querySelector("p p")).toBeNull();
  });
});
