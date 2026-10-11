import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it, vi } from "vitest";

import { VariableChip } from "./variable-chip";

describe("VariableChip", () => {
  it("AC-MSG-006 inserts its variable when pressed", async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();
    render(<VariableChip name="projectTitle" isRequired={false} onInsert={onInsert} />);

    await user.click(screen.getByRole("button", { name: "Sisipkan {{projectTitle}}" }));
    expect(onInsert).toHaveBeenCalledWith("projectTitle");
  });

  it("AC-MSG-005 marks the required variable", () => {
    render(<VariableChip name="galleryUrl" isRequired onInsert={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Sisipkan {{galleryUrl}}, wajib" }),
    ).toHaveTextContent("Wajib");
  });

  it("names the variable and the required marker in English", () => {
    renderInLocale(<VariableChip name="galleryUrl" isRequired onInsert={vi.fn()} />, "en");

    expect(
      screen.getByRole("button", { name: "Insert {{galleryUrl}}, required" }),
    ).toHaveTextContent("Required");
  });
});
