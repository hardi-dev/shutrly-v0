import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BottomNav } from "../bottom-nav/bottom-nav";
import { MobileAppShell } from "./mobile-app-shell";
import { MOBILE_APP_SHELL_COPY } from "./mobile-app-shell.copy";

function handleNoop() {
  return undefined;
}

const meta = {
  title: "Patterns/Mobile App Shell",
  component: MobileAppShell,
  args: {
    title: MOBILE_APP_SHELL_COPY.story.title,
    children: (
      <div className="rounded-(--radius-md) bg-(--color-semantic-surface-panel) p-(--space-4)">
        {MOBILE_APP_SHELL_COPY.story.body}
      </div>
    ),
    bottomNav: (
      <BottomNav
        items={[
          {
            href: "/",
            label: MOBILE_APP_SHELL_COPY.story.dashboard,
            icon: "layout-grid",
            isActive: true,
          },
          {
            href: "/projects",
            label: MOBILE_APP_SHELL_COPY.story.projects,
            icon: "folder-kanban",
            count: 12,
          },
          { href: "/clients", label: MOBILE_APP_SHELL_COPY.story.clients, icon: "users" },
          { href: "/more", label: MOBILE_APP_SHELL_COPY.story.more, icon: "menu" },
        ]}
        ctaLabel={MOBILE_APP_SHELL_COPY.story.newProject}
        onCtaPress={handleNoop}
      />
    ),
  },
  parameters: { designSystemSpec: "docs/design-system/components/mobile-app-shell.md" },
} satisfies Meta<typeof MobileAppShell>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
