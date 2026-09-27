import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountBadge } from "./count-badge";

describe("CountBadge (C13)", () => {
  it("renders numeric counts and caps counts at 99+", () => {
    render(
      <>
        <CountBadge count={12} />
        <CountBadge count={120} />
      </>,
    );

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("hides a zero count", () => {
    const { container } = render(<CountBadge count={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("supports the danger notification variant", () => {
    render(<CountBadge count={12} variant="danger" />);

    expect(screen.getByText("12")).toHaveClass(
      "bg-(--component-badge-danger-background)",
      "text-(--component-badge-danger-text)",
    );
  });
});
