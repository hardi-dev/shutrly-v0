import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { IconButton } from "./icon-button";

const meta = {
  title: "Primitives/Icon Button",
  component: IconButton,
  tags: ["autodocs"],
  args: { icon: "menu", "aria-label": "Menu" },
  argTypes: {
    icon: { control: "select" },
    size: { control: "select", options: ["sm", "md"] },
    isDisabled: { control: "boolean" },
  },
  parameters: { designSystemSpec: "docs/design-system/components/icon-button.md" },
} satisfies Meta<typeof IconButton>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Small: StoryObj<typeof meta> = { args: { size: "sm" } };
export const Disabled: StoryObj<typeof meta> = { args: { isDisabled: true } };
