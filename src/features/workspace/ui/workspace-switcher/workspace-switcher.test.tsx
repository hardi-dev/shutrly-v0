import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { showToast } from "@/ui/patterns/toast/toast";

import { WorkspaceSwitcher } from "./workspace-switcher";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const workspaces = [
  { id: "other", name: "Studio Lime", isCurrent: false },
  { id: "current", name: "Aster Wedding", isCurrent: true },
] as const;

function handleSwitch() {}
function handleCreate() {}

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

  it("delegates the create action to its owner", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(
      <WorkspaceSwitcher
        currentName="Aster Wedding"
        workspaces={workspaces}
        onSwitch={handleSwitch}
        onCreate={onCreate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Aster Wedding" }));
    await user.click(screen.getByRole("menuitem", { name: "Buat workspace" }));

    expect(onCreate).toHaveBeenCalledOnce();
  });

  it("lists workspaces alphabetically under the group label before the create CTA", async () => {
    const user = userEvent.setup();

    render(
      <WorkspaceSwitcher
        currentName="Aster Wedding"
        workspaces={workspaces}
        onSwitch={handleSwitch}
        onCreate={handleCreate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Aster Wedding" }));

    expect(screen.getByText("Pindah workspace")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Aster Wedding",
      "Studio Lime",
      "Buat workspace",
    ]);
    for (const name of ["Aster Wedding", "Studio Lime"]) {
      expect(screen.getByRole("menuitem", { name })).toHaveClass(
        "min-h-[52px]",
        "border-t",
        "px-(--component-sheet-item-padding-x)",
      );
    }
  });

  it("toasts a failed switch with a retry for the same workspace", async () => {
    const user = userEvent.setup();
    const onSwitch = vi.fn().mockRejectedValue(new Error("offline"));

    render(
      <WorkspaceSwitcher
        currentName="Aster Wedding"
        workspaces={workspaces}
        onSwitch={onSwitch}
        onCreate={handleCreate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Aster Wedding" }));
    await user.click(screen.getByRole("menuitem", { name: "Studio Lime" }));

    expect(onSwitch).toHaveBeenCalledWith("other");
    const toast = vi.mocked(showToast).mock.calls[0]?.[0];
    expect(toast.tone).toBe("danger");
    expect(toast.title).toBe("Gagal pindah workspace");
    expect(toast.body).toBe("Kamu masih di Aster Wedding.");
    expect(toast.action?.label).toBe("Coba lagi");
  });
});
