import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NavItem } from "../nav-item/nav-item";
import { Sidebar } from "./sidebar";
import { SIDEBAR_STORY_COPY } from "./sidebar.stories.copy";

const meta = {
  title: "Patterns/Sidebar",
  component: Sidebar,
  args: {
    workspace: { name: SIDEBAR_STORY_COPY.workspace },
    account: {
      name: SIDEBAR_STORY_COPY.account,
      email: SIDEBAR_STORY_COPY.email,
      initials: "HA",
    },
    children: (
      <>
        <NavItem
          href="/projects"
          label={SIDEBAR_STORY_COPY.projects}
          icon="folder-kanban"
          isActive
        />
        <NavItem href="/clients" label={SIDEBAR_STORY_COPY.clients} icon="users" />
      </>
    ),
    navBottom: <NavItem href="/settings" label={SIDEBAR_STORY_COPY.settings} icon="settings" />,
  },
  parameters: { designSystemSpec: "docs/design-system/components/sidebar.md" },
} satisfies Meta<typeof Sidebar>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
