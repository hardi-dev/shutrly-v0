import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthSplitLayout } from "./auth-split-layout";
import { AUTH_SPLIT_LAYOUT_COPY } from "./auth-split-layout.copy";

describe("AuthSplitLayout", () => {
  it("AC-AUTH-023 puts the screen in a main landmark with the brand and footer", () => {
    render(
      <AuthSplitLayout>
        <h1>Heading</h1>
      </AuthSplitLayout>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("Heading");
    expect(screen.getByText(AUTH_SPLIT_LAYOUT_COPY.brand)).toBeInTheDocument();
    expect(screen.getByText(AUTH_SPLIT_LAYOUT_COPY.footer)).toBeInTheDocument();
  });

  it("AC-AUTH-023 hides the editorial panel below the desktop breakpoint", () => {
    const { container } = render(<AuthSplitLayout>x</AuthSplitLayout>);
    expect(container.querySelector('[data-slot="editorial"]')).toHaveClass("hidden", "lg:block");
  });
});
