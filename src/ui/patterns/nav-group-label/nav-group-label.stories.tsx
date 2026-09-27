import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NavGroupLabel } from "./nav-group-label";

const meta = {
  title: "Patterns/Nav Group Label",
  component: NavGroupLabel,
  args: { children: "Katalog" },
  parameters: { designSystemSpec: "docs/design-system/components/nav-item.md" },
} satisfies Meta<typeof NavGroupLabel>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
