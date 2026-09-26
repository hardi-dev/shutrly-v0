import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import { BUTTON_STORY_COPY } from "./button.stories.copy";

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: BUTTON_STORY_COPY.save },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary"] },
    isDisabled: { control: "boolean" },
  },
  parameters: {
    designSystemSpec: "docs/design-system/components/button.md",
  },
} satisfies Meta<typeof Button>;

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: { children: BUTTON_STORY_COPY.save, variant: "primary" },
};
export const Secondary: StoryObj<typeof meta> = {
  args: { children: BUTTON_STORY_COPY.cancel, variant: "secondary" },
};
export const Disabled: StoryObj<typeof meta> = {
  args: { children: BUTTON_STORY_COPY.disabled, variant: "primary", isDisabled: true },
};
export const Variants: StoryObj<typeof meta> = {
  render: () => (
    <div className="flex flex-wrap gap-(--space-4)">
      <Button variant="primary">{BUTTON_STORY_COPY.save}</Button>
      <Button variant="secondary">{BUTTON_STORY_COPY.cancel}</Button>
    </div>
  ),
};
