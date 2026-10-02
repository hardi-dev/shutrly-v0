import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusChip } from "./status-chip";

describe("StatusChip (C12)", () => {
  it("AC-SRC-003 shows the label with the tone's tokens and a dot", () => {
    const { container } = render(<StatusChip tone="success" label="Aktif" />);
    expect(screen.getByText("Aktif").parentElement).toHaveClass(
      "bg-(--component-chip-status-success-background)",
      "text-(--component-chip-status-success-text)",
    );
    expect(container.querySelector("[data-slot=dot]")).not.toBeNull();
  });

  it("AC-SRC-007 hides the dot for availability labels", () => {
    const { container } = render(<StatusChip tone="neutral" label="Segera hadir" hasDot={false} />);
    expect(container.querySelector("[data-slot=dot]")).toBeNull();
  });
});
