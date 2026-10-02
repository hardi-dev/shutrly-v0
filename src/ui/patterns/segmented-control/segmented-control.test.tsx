import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./segmented-control";

const OPTIONS = [
  { id: "edit", label: "Edit" },
  { id: "preview", label: "Pratinjau" },
];

describe("SegmentedControl (C23)", () => {
  it("names the group and marks the selected option", () => {
    render(
      <SegmentedControl label="Tampilan" options={OPTIONS} selectedId="edit" onChange={vi.fn()} />,
    );

    expect(screen.getByRole("radiogroup", { name: "Tampilan" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Edit" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Pratinjau" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("reports the newly selected option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl label="Tampilan" options={OPTIONS} selectedId="edit" onChange={onChange} />,
    );

    await user.click(screen.getByRole("radio", { name: "Pratinjau" }));
    expect(onChange).toHaveBeenCalledWith("preview");
  });

  it("gives every option the same width", () => {
    render(
      <SegmentedControl label="Tampilan" options={OPTIONS} selectedId="edit" onChange={vi.fn()} />,
    );

    expect(screen.getByRole("radiogroup", { name: "Tampilan" })).toHaveClass(
      "grid-flow-col",
      "auto-cols-fr",
    );
  });

  it("renders a full-width centered variant", () => {
    render(
      <SegmentedControl
        label="Bagian layanan"
        options={OPTIONS}
        selectedId="edit"
        onChange={vi.fn()}
        isFullWidth
      />,
    );

    expect(screen.getByRole("radiogroup", { name: "Bagian layanan" })).toHaveClass("w-full");
    expect(screen.getByRole("radio", { name: "Edit" })).toHaveClass(
      "w-full",
      "flex-1",
      "justify-center",
    );
  });
});
