import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BottomNavItem } from "./bottom-nav-item";

const meta = {
  title: "Patterns/Bottom Nav Item",
  component: BottomNavItem,
  args: { href: "/projects", label: "Proyek", icon: "folder-kanban" },
  parameters: { designSystemSpec: "docs/design-system/components/bottom-nav.md" },
} satisfies Meta<typeof BottomNavItem>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
export const ActiveWithCount: StoryObj<typeof meta> = {
  args: { isActive: true, count: 12 },
};
