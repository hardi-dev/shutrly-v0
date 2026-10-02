import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Select } from "./select";
import { SELECT_STORY_COPY } from "./select.stories.copy";

const OPTIONS = [
  {
    id: "NUMBER",
    label: SELECT_STORY_COPY.number,
    description: SELECT_STORY_COPY.numberDescription,
    icon: "hash" as const,
  },
  {
    id: "RANGE",
    label: SELECT_STORY_COPY.range,
    description: SELECT_STORY_COPY.rangeDescription,
    icon: "move-horizontal" as const,
  },
];

const meta = {
  title: "Patterns/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    designSystemSpec: "docs/design-system/components/select.md",
  },
} satisfies Meta<typeof Select>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    label: SELECT_STORY_COPY.label,
    options: OPTIONS,
    value: "NUMBER",
    onChange: () => undefined,
  },
};

export const RichOptions: StoryObj<typeof meta> = Default;

export const Disabled: StoryObj<typeof meta> = {
  args: { ...Default.args, label: SELECT_STORY_COPY.disabled, isDisabled: true },
};

export const ErrorState: StoryObj<typeof meta> = {
  args: {
    ...Default.args,
    label: SELECT_STORY_COPY.disabled,
    errorMessage: SELECT_STORY_COPY.error,
  },
};
