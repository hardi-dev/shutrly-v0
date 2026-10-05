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

  it("hides the browser's native search clear button so only the designed x shows", () => {
    render(<Input aria-label="Search" variant="search" />);

    expect(screen.getByLabelText("Search")).toHaveClass(
      "[&::-webkit-search-cancel-button]:appearance-none",
    );
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

  it("keeps combined adornments in separate groups without overlapping the value", () => {
    render(
      <Input
        aria-label="Project"
        prefix="Rp"
        iconLeading="search"
        iconTrailing="chevron-down"
        shortcut="⌘K"
      />,
    );

    const input = screen.getByLabelText("Project");
    expect(input).toHaveClass(
      "pl-[calc(var(--component-input-padding-x)+var(--space-6)+var(--space-6))]",
      "pr-[calc(var(--component-input-padding-x)+var(--space-6)+var(--space-6))]",
    );
    expect(screen.getByTestId("input-adornment-leading")).toContainElement(
      screen.getByTestId("input-icon-leading"),
    );
    expect(screen.getByTestId("input-adornment-trailing")).toContainElement(
      screen.getByTestId("input-icon-trailing"),
    );
  });

  it("supports accessible actions on both leading and trailing icons", async () => {
    const user = userEvent.setup();
    const onLeadingPress = vi.fn();
    const onTrailingPress = vi.fn();
    render(
      <Input
        aria-label="Password"
        type="password"
        iconLeading="search"
        iconLeadingAction={{ label: "Cari", onPress: onLeadingPress }}
        iconTrailing="eye"
        iconTrailingAction={{ label: "Tampilkan password", onPress: onTrailingPress }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cari" }));
    await user.click(screen.getByRole("button", { name: "Tampilkan password" }));

    expect(onLeadingPress).toHaveBeenCalledTimes(1);
    expect(onTrailingPress).toHaveBeenCalledTimes(1);
  });

  it("disables only the trailing action when the action says so, not the field", () => {
    render(
      <Input
        aria-label="Password"
        iconTrailing="refresh-cw"
        iconTrailingAction={{ label: "Buat ulang", onPress: vi.fn(), isDisabled: true }}
      />,
    );
    expect(screen.getByRole("button", { name: "Buat ulang" })).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeEnabled();
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

  it("uses the disabled text token for a filled disabled value", () => {
    render(<Input aria-label="Disabled name" value="Nama proyek" isDisabled />);

    expect(screen.getByLabelText("Disabled name")).toHaveClass(
      "data-disabled:text-(--component-input-text-disabled)",
    );
  });

  it("marks the prefix of a disabled input as disabled so contrast checks skip it", () => {
    render(<Input aria-label="Harga" prefix="Rp" isDisabled value="1" onChange={vi.fn()} />);
    expect(screen.getByTestId("input-adornment-leading")).toHaveAttribute("aria-disabled", "true");
  });
});
