import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tooltip } from "./tooltip";

describe("Tooltip (C37)", () => {
  it("shows the label after focus and links it to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip label="Pengaturan">
        <button aria-label="Pengaturan">Settings</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Pengaturan" });
    await user.tab();
    expect(trigger).toHaveAttribute("aria-describedby");
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Pengaturan");
  });
});
