import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BottomNav } from "../bottom-nav/bottom-nav";
import { MobileAppShell } from "./mobile-app-shell";
import { MOBILE_APP_SHELL_STORY_COPY } from "./mobile-app-shell.stories.copy";

function handleNoop() {
  return undefined;
}

const meta = {
  title: "Patterns/Mobile App Shell",
  component: MobileAppShell,
  args: {
    title: MOBILE_APP_SHELL_STORY_COPY.title,
    children: (
      <div className="rounded-(--radius-md) bg-(--color-semantic-surface-panel) p-(--space-4)">
        {MOBILE_APP_SHELL_STORY_COPY.body}
      </div>
    ),
    bottomNav: (
      <BottomNav
        items={[
          {
            href: "/",
            label: MOBILE_APP_SHELL_STORY_COPY.dashboard,
            icon: "layout-grid",
            isActive: true,
          },
          {
            href: "/projects",
            label: MOBILE_APP_SHELL_STORY_COPY.projects,
            icon: "folder-kanban",
            count: 12,
          },
          { href: "/clients", label: MOBILE_APP_SHELL_STORY_COPY.clients, icon: "users" },
          { href: "/more", label: MOBILE_APP_SHELL_STORY_COPY.more, icon: "menu" },
        ]}
        ctaLabel={MOBILE_APP_SHELL_STORY_COPY.newProject}
        onCtaPress={handleNoop}
      />
    ),
  },
  parameters: { designSystemSpec: "docs/design-system/components/mobile-app-shell.md" },
} satisfies Meta<typeof MobileAppShell>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
