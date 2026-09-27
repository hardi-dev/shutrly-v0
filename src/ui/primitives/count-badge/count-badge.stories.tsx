import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CountBadge } from "./count-badge";

const meta = {
  title: "Primitives/Count Badge",
  component: CountBadge,
  tags: ["autodocs"],
  args: { count: 12 },
  parameters: { designSystemSpec: "docs/design-system/components/count-badge.md" },
} satisfies Meta<typeof CountBadge>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Capped: StoryObj<typeof meta> = { args: { count: 120 } };
export const Hidden: StoryObj<typeof meta> = { args: { count: 0 } };
