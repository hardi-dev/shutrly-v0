import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NavRailItem } from "../nav-rail-item/nav-rail-item";
import { SidebarRail } from "./sidebar-rail";

describe("SidebarRail (C37)", () => {
  it("renders the compact 72px rail with active navigation and account avatar", () => {
    render(
      <SidebarRail
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
      >
        <NavRailItem href="/projects" label="Proyek" icon="folder-kanban" isActive />
      </SidebarRail>,
    );

    expect(screen.getByRole("complementary")).toHaveClass("w-(--size-rail)");
    expect(screen.getByRole("link", { name: "Proyek" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByLabelText("Hardi Ansari")).toBeInTheDocument();
  });

  it("exposes the Expand action for the tablet overlay", () => {
    const onExpand = vi.fn();
    render(
      <SidebarRail
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        onExpand={onExpand}
      >
        <span>Nav</span>
      </SidebarRail>,
    );

    screen.getByRole("button", { name: "Buka sidebar" }).click();
    expect(onExpand).toHaveBeenCalledOnce();
  });
});
