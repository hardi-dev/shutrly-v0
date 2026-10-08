import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Stepper } from "./stepper";
import { STEPPER_STORY_COPY } from "./stepper.stories.copy";

const meta = {
  title: "Primitives/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    designSystemSpec: "docs/design-system/components/stepper.md",
  },
} satisfies Meta<typeof Stepper>;

export default meta;

const base = { label: STEPPER_STORY_COPY.label, onChange: () => undefined, max: 4 };

export const Default: StoryObj<typeof meta> = { args: { ...base, value: 2 } };
export const AtMinimum: StoryObj<typeof meta> = { args: { ...base, value: 1 } };
export const AtMaximum: StoryObj<typeof meta> = { args: { ...base, value: 4 } };
export const Disabled: StoryObj<typeof meta> = { args: { ...base, value: 2, isDisabled: true } };
