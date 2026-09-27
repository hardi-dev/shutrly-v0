import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NavItem } from "../nav-item/nav-item";
import { AppShell } from "./app-shell";
import { APP_SHELL_STORY_COPY } from "./app-shell.stories.copy";

function handleNoop() {
  return undefined;
}

const meta = {
  title: "Patterns/App Shell",
  component: AppShell,
  args: {
    title: APP_SHELL_STORY_COPY.title,
    workspace: { name: APP_SHELL_STORY_COPY.workspace },
    account: {
      name: APP_SHELL_STORY_COPY.account,
      email: APP_SHELL_STORY_COPY.email,
      initials: "HA",
    },
    nav: (
      <>
        <NavItem href="/" label={APP_SHELL_STORY_COPY.dashboard} icon="layout-grid" isActive />
        <NavItem
          href="/projects"
          label={APP_SHELL_STORY_COPY.projects}
          icon="folder-kanban"
          count={12}
        />
        <NavItem href="/clients" label={APP_SHELL_STORY_COPY.clients} icon="users" />
      </>
    ),
    children: <p>{APP_SHELL_STORY_COPY.body}</p>,
    mobileBottomNav: {
      items: [
        { href: "/", label: APP_SHELL_STORY_COPY.dashboard, icon: "layout-grid", isActive: true },
        {
          href: "/projects",
          label: APP_SHELL_STORY_COPY.projects,
          icon: "folder-kanban",
          count: 12,
        },
        { href: "/clients", label: APP_SHELL_STORY_COPY.clients, icon: "users" },
        { href: "/more", label: APP_SHELL_STORY_COPY.more, icon: "menu" },
      ],
      ctaLabel: APP_SHELL_STORY_COPY.newProject,
      onCtaPress: handleNoop,
    },
  },
  parameters: { designSystemSpec: "docs/design-system/components/app-shell.md" },
} satisfies Meta<typeof AppShell>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
