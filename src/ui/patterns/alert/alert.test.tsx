import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./alert";

describe("Alert (C24)", () => {
  it("AC-AUTH-023 static guidance is not announced as a live region", () => {
    render(<Alert tone="info" title="Title" body="Body" />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("AC-AUTH-023 live danger feedback uses role=alert and can take focus", () => {
    render(<Alert tone="danger" title="Wrong" live />);
    expect(screen.getByRole("alert")).toHaveAttribute("tabindex", "-1");
  });

  it("AC-AUTH-023 live info feedback uses role=status", () => {
    render(<Alert tone="info" title="Sent" live />);
    expect(screen.getByRole("status")).toHaveTextContent("Sent");
  });

  it("AC-AUTH-008 renders the title only when there is no body, with a decorative icon", () => {
    const { container } = render(<Alert tone="danger" title="Only title" />);
    expect(container.querySelectorAll("p")).toHaveLength(1);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("AC-AUTH-023 live success feedback uses role=status and success tokens", () => {
    render(<Alert tone="success" title="Tersimpan" live />);
    const alert = screen.getByRole("status");

    expect(alert).toHaveAttribute("data-tone", "success");
    expect(alert).toHaveClass(
      "bg-(--component-alert-success-background)",
      "border-(--component-alert-success-border)",
    );
  });
});
