import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("renders default and search variants with the approved token contracts", () => {
    render(
      <>
        <Input aria-label="Name" placeholder="Nama" />
        <Input aria-label="Search" variant="search" iconLeading="search" shortcut="⌘K" />
      </>,
    );

    expect(screen.getByLabelText("Name")).toHaveAttribute("data-variant", "default");
    expect(screen.getByLabelText("Search")).toHaveAttribute("data-variant", "search");
    expect(screen.getByLabelText("Search")).toHaveAttribute("role", "searchbox");
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("supports filled, prefix and trailing icon configurations", () => {
    render(
      <Input
        aria-label="Harga"
        value="150000"
        prefix="Rp"
        iconTrailing="circle-alert"
        isInvalid
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Harga")).toHaveValue("150000");
    expect(screen.getByText("Rp")).toBeInTheDocument();
    expect(screen.getByTestId("input-icon-trailing")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByLabelText("Harga")).toHaveAttribute("aria-invalid", "true");
  });

  it("reports string changes and preserves disabled behavior", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Name" onChange={onChange} isDisabled />);
    const input = screen.getByLabelText("Name");

    expect(input).toBeDisabled();
    await user.type(input, "A");
    expect(onChange).not.toHaveBeenCalled();
  });
});
