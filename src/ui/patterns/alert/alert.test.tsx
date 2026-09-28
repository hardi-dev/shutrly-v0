import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

  it("renders a dismiss control in the top-right when onClose is provided", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<Alert tone="info" title="Tersimpan" onClose={onClose} closeLabel="Tutup" />);

    const closeButton = screen.getByRole("button", { name: "Tutup" });
    expect(closeButton).toHaveClass("size-(--space-8)");

    await user.click(closeButton);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("supports warning and highlight tones from the Alert token set", () => {
    render(
      <>
        <Alert tone="warning" title="Perlu perhatian" />
        <Alert tone="highlight" title="Info pilihan" />
      </>,
    );

    expect(screen.getByText("Perlu perhatian")).toHaveClass(
      "text-(--component-alert-warning-title)",
    );
    expect(screen.getByText("Info pilihan")).toHaveClass(
      "text-(--component-alert-highlight-title)",
    );
  });
});
