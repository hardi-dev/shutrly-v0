import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import { BUTTON_STORY_COPY } from "./button.stories.copy";

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: BUTTON_STORY_COPY.save },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "danger"] },
    size: { control: "select", options: ["md", "lg"] },
    iconLeading: { control: "select", options: [undefined, "plus", "send", "trash-2"] },
    iconTrailing: { control: "select", options: [undefined, "chevron-down", "arrow-right"] },
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
export const Danger: StoryObj<typeof meta> = {
  args: { children: BUTTON_STORY_COPY.delete, variant: "danger", iconLeading: "trash-2" },
};
export const Disabled: StoryObj<typeof meta> = {
  args: { children: BUTTON_STORY_COPY.disabled, variant: "primary", isDisabled: true },
};
export const Variants: StoryObj<typeof meta> = {
  render: () => (
    <div className="flex flex-wrap gap-(--space-4)">
      <Button variant="primary">{BUTTON_STORY_COPY.save}</Button>
      <Button variant="secondary">{BUTTON_STORY_COPY.cancel}</Button>
      <Button variant="danger">{BUTTON_STORY_COPY.delete}</Button>
    </div>
  ),
};

export const Matrix: StoryObj<typeof meta> = {
  render: () => (
    <div className="grid gap-(--space-4)">
      {(["primary", "secondary", "danger"] as const).map((variant) => (
        <div className="flex flex-wrap items-center gap-(--space-4)" key={variant}>
          <Button variant={variant} size="md">
            {BUTTON_STORY_COPY.matrix[variant].md}
          </Button>
          <Button variant={variant} size="lg">
            {BUTTON_STORY_COPY.matrix[variant].lg}
          </Button>
          <Button variant={variant} size="md" isDisabled>
            {BUTTON_STORY_COPY.matrix[variant].disabled}
          </Button>
        </div>
      ))}
    </div>
  ),
};
