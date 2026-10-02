import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OptionCardGroup } from "./option-card-group";

const OPTIONS = [
  {
    value: "GOOGLE_DRIVE",
    title: "Google Drive",
    description: "Folder…",
    icon: "hard-drive" as const,
  },
  {
    value: "DROPBOX",
    title: "Dropbox",
    icon: "dropbox" as const,
    isDisabled: true,
    badge: "Segera hadir",
  },
];

describe("OptionCardGroup (C44)", () => {
  it("AC-SRC-007 selects available options and announces disabled ones", async () => {
    const onChange = vi.fn();
    render(
      <OptionCardGroup
        label="Provider"
        options={OPTIONS}
        value="GOOGLE_DRIVE"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "Provider" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Google Drive/ })).toBeChecked();
    const dropbox = screen.getByRole("radio", { name: /Dropbox.*Segera hadir/ });
    expect(dropbox).toBeDisabled();
    await userEvent.click(screen.getByText("Dropbox"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
