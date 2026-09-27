import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./icon-button";

describe("IconButton (C02)", () => {
  it("renders an accessible ghost button in MD and invokes its action", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<IconButton icon="x" aria-label="Tutup" onPress={onPress} />);

    const button = screen.getByRole("button", { name: "Tutup" });
    expect(button).toHaveClass("size-(--space-10)");
    await user.click(button);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("supports the compact SM size and disabled state", () => {
    render(<IconButton icon="menu" size="sm" aria-label="Menu" isDisabled />);

    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveClass("size-(--space-8)");
    expect(button).toBeDisabled();
  });
});
