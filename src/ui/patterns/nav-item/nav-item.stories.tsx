import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NavItem } from "./nav-item";

const meta = {
  title: "Patterns/Nav Item",
  component: NavItem,
  args: { href: "/projects", label: "Proyek", icon: "folder-kanban" },
  parameters: { designSystemSpec: "docs/design-system/components/nav-item.md" },
} satisfies Meta<typeof NavItem>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
export const ActiveWithCount: StoryObj<typeof meta> = {
  args: { isActive: true, count: 12 },
};
