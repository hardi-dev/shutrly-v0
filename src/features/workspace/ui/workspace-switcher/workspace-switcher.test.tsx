import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkspaceSwitcher } from "./workspace-switcher";

const workspaces = [
  { id: "current", name: "Aster Wedding", isCurrent: true },
  { id: "other", name: "Studio Lime", isCurrent: false },
] as const;

async function handleSwitch() {}
async function handleCreate() {}

describe("WorkspaceSwitcher", () => {
  it("renders the sidebar trigger anatomy in expanded mode", () => {
    render(
      <WorkspaceSwitcher
        currentName="Aster Wedding"
        workspaces={workspaces}
        onSwitch={handleSwitch}
        onCreate={handleCreate}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Aster Wedding" });
    expect(trigger).toHaveClass(
      "w-full",
      "px-(--component-sidebar-padding-x)",
      "py-(--component-sidebar-padding-y)",
    );
    expect(trigger.querySelector('svg[data-icon="camera"]')).toBeInTheDocument();
    expect(trigger.querySelector('svg[data-icon="chevrons-up-down"]')).toBeInTheDocument();
    expect(screen.getByText("Aster Wedding")).toBeInTheDocument();
  });

  it("renders the compact rail trigger without workspace text", () => {
    render(
      <WorkspaceSwitcher
        currentName="Aster Wedding"
        workspaces={workspaces}
        isCompact
        onSwitch={handleSwitch}
        onCreate={handleCreate}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Aster Wedding" });
    expect(trigger).toHaveClass("size-(--space-10)");
    expect(trigger.querySelector('svg[data-icon="chevrons-up-down"]')).toBeInTheDocument();
    expect(trigger.querySelector('svg[data-icon="camera"]')).toBeNull();
    expect(screen.queryByText("Aster Wedding")).toBeNull();
  });
});
