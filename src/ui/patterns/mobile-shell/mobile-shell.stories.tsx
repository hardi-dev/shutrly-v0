import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/ui/primitives/button/button";

import { BottomNav } from "../bottom-nav/bottom-nav";
import { CompactBar } from "../compact-bar/compact-bar";
import { MobileShell } from "./mobile-shell";
import { MOBILE_SHELL_STORY_COPY as COPY } from "./mobile-shell.stories.copy";

function handleNoop() {
  return undefined;
}

const bottomNav = (
  <BottomNav
    items={[
      { href: "/", label: COPY.dashboard, icon: "layout-grid" },
      { href: "/projects", label: COPY.projects, icon: "folder-kanban" },
      { href: "/clients", label: COPY.clients, icon: "users" },
      { href: "/invoices", label: COPY.invoices, icon: "receipt" },
    ]}
    ctaLabel={COPY.newProject}
    onCtaPress={handleNoop}
  />
);

const meta = {
  title: "Patterns/Mobile Shell",
  component: MobileShell,
  args: {
    compactBar: (
      <CompactBar
        title={COPY.title}
        parent={{ label: COPY.parent, href: "/message-templates" }}
        actions={
          <Button variant="secondary" isDisabled>
            {COPY.save}
          </Button>
        }
      />
    ),
    bottomNav,
    children: (
      <div className="rounded-(--radius-md) bg-(--color-semantic-surface-panel) p-(--space-4)">
        {COPY.body}
      </div>
    ),
  },
  parameters: { designSystemSpec: "docs/design-system/components/mobile-shell.md" },
} satisfies Meta<typeof MobileShell>;

export default meta;
export const WithAction: StoryObj<typeof meta> = {};
export const WithoutAction: StoryObj<typeof meta> = {
  args: {
    compactBar: (
      <CompactBar title={COPY.title} parent={{ label: COPY.parent, href: "/message-templates" }} />
    ),
  },
};
