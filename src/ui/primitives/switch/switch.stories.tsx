import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Switch } from "./switch";
import { SWITCH_STORY_COPY } from "./switch.stories.copy";

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    designSystemSpec: "docs/design-system/components/switch.md",
  },
} satisfies Meta<typeof Switch>;

export default meta;

export const Off: StoryObj<typeof meta> = {
  args: { label: SWITCH_STORY_COPY.label, isSelected: false, onChange: () => undefined },
};

export const On: StoryObj<typeof meta> = {
  args: {
    label: SWITCH_STORY_COPY.label,
    description: SWITCH_STORY_COPY.description,
    isSelected: true,
    onChange: () => undefined,
  },
};

export const DisabledOn: StoryObj<typeof meta> = {
  args: {
    label: SWITCH_STORY_COPY.label,
    isSelected: true,
    isDisabled: true,
    onChange: () => undefined,
  },
};
