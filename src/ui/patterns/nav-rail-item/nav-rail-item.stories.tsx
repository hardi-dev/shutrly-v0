import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NavRailItem } from "./nav-rail-item";

const meta = {
  title: "Patterns/Nav Rail Item",
  component: NavRailItem,
  args: { href: "/settings", label: "Pengaturan", icon: "settings" },
  parameters: { designSystemSpec: "docs/design-system/components/nav-rail.md" },
} satisfies Meta<typeof NavRailItem>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
export const Active: StoryObj<typeof meta> = { args: { isActive: true } };
