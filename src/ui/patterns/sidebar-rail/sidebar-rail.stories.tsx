import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NavItem } from "../nav-item/nav-item";
import { SidebarRail } from "./sidebar-rail";
import { SIDEBAR_RAIL_STORY_COPY } from "./sidebar-rail.stories.copy";

const meta = {
  title: "Patterns/Sidebar Rail",
  component: SidebarRail,
  args: {
    workspace: { name: SIDEBAR_RAIL_STORY_COPY.workspace },
    account: { name: SIDEBAR_RAIL_STORY_COPY.account, email: "hardi@example.com", initials: "HA" },
    children: (
      <>
        <NavItem
          href="/projects"
          label={SIDEBAR_RAIL_STORY_COPY.projects}
          icon="folder-kanban"
          isActive
          isCompact
        />
        <NavItem href="/clients" label={SIDEBAR_RAIL_STORY_COPY.clients} icon="users" isCompact />
      </>
    ),
    navBottom: (
      <NavItem
        href="/settings"
        label={SIDEBAR_RAIL_STORY_COPY.settings}
        icon="settings"
        isCompact
      />
    ),
  },
  parameters: { designSystemSpec: "docs/design-system/components/nav-rail.md" },
} satisfies Meta<typeof SidebarRail>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
