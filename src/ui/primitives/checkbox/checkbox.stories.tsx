import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "./checkbox";
import { CHECKBOX_STORY_COPY as COPY } from "./checkbox.stories.copy";

const meta = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: { designSystemSpec: "docs/design-system/components/checkbox.md" },
  args: { label: COPY.label, isSelected: false, onChange: () => undefined },
} satisfies Meta<typeof Checkbox>;

export default meta;

export const Unchecked: StoryObj<typeof meta> = {};
export const Checked: StoryObj<typeof meta> = { args: { isSelected: true } };
export const Disabled: StoryObj<typeof meta> = { args: { isDisabled: true } };
