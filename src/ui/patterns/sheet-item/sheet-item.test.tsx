import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SheetItem } from "./sheet-item";

describe("SheetItem (C32)", () => {
  function handleNoop() {
    return undefined;
  }

  it("renders an icon action with a count and invokes its handler", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<SheetItem label="Invoice" icon="receipt" count={3} onPress={onPress} />);

    const item = screen.getByRole("button", { name: "Invoice 3" });
    expect(item).toHaveClass("min-h-[52px]");
    expect(screen.getByText("3")).toBeInTheDocument();
    await user.click(item);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("uses the destructive text token while keeping the action label", () => {
    render(
      <SheetItem
        label="Hapus dari pilihan"
        icon="trash-2"
        variant="destructive"
        onPress={handleNoop}
      />,
    );

    expect(screen.getByRole("button", { name: "Hapus dari pilihan" })).toHaveClass(
      "text-(--component-sheet-item-text-destructive)",
    );
  });

  it("shows the selection check on the trailing edge", () => {
    render(<SheetItem label="Studio Lime" isSelected onPress={handleNoop} />);

    const item = screen.getByRole("button", { name: "Studio Lime" });
    expect(item.querySelector('[data-testid="sheet-item-check"]')).toBeInTheDocument();
  });
});
