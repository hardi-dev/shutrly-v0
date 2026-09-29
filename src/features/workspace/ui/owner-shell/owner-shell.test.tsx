import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MobileWorkspaceSheet, MobileWorkspaceSwitcherSheet } from "./owner-shell";

const workspaces = [
  { id: "workspace-1", name: "Studio Lime", isCurrent: true },
  { id: "workspace-2", name: "Aster Wedding", isCurrent: false },
] as const;

describe("MobileWorkspaceSwitcherSheet", () => {
  it("shows workspace choices and the create workspace CTA", async () => {
    const user = userEvent.setup();
    const onSwitch = vi.fn(() => Promise.resolve());

    render(
      <MobileWorkspaceSwitcherSheet
        isOpen
        onOpenChange={vi.fn()}
        currentName="Studio Lime"
        workspaces={workspaces}
        onSwitch={onSwitch}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Pindah workspace" })).toBeInTheDocument();
    expect(screen.getByText("2 workspace")).toBeInTheDocument();
    const names = screen
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label"))
      .filter((name) => name === "Studio Lime" || name === "Aster Wedding");
    expect(names).toEqual(["Aster Wedding", "Studio Lime"]);
    const createButton = screen.getByRole("button", { name: "Buat workspace" });
    expect(createButton).toHaveAttribute("data-variant", "primary");
    expect(createButton.closest("footer")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Aster Wedding" }));
    expect(onSwitch).toHaveBeenCalledWith("workspace-2");
  });
});

describe("MobileWorkspaceSheet", () => {
  it("renders the menu destinations without switcher or invoice", () => {
    render(
      <MobileWorkspaceSheet
        isOpen
        onOpenChange={vi.fn()}
        accountName="Hardi Ansari"
        accountEmail="hardi@example.com"
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText("KATALOG")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label"))
        .filter(Boolean),
    ).toEqual(
      expect.arrayContaining(["Layanan", "Tim", "Template pesan", "Sumber klien", "Pengaturan"]),
    );
    const labels = screen.getAllByRole("button").map((button) => button.textContent);
    expect(labels.indexOf("Layanan")).toBeLessThan(labels.indexOf("Tim"));
    expect(labels.indexOf("Tim")).toBeLessThan(labels.indexOf("Template pesan"));
    expect(screen.queryByRole("button", { name: "Studio Lime" })).toBeNull();
    expect(screen.queryByText("Invoice")).toBeNull();
    expect(screen.queryByRole("button", { name: "Buat workspace" })).toBeNull();
  });
});
