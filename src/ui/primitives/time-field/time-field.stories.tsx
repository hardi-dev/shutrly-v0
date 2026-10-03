import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TimeField } from "./time-field";
import { TIME_FIELD_STORY_COPY as COPY } from "./time-field.stories.copy";

const meta = {
  title: "Primitives/TimeField",
  component: TimeField,
  tags: ["autodocs"],
  args: { label: COPY.label, value: "07:30", onChange: () => undefined },
} satisfies Meta<typeof TimeField>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Empty: StoryObj<typeof meta> = { args: { value: null, isOptional: true } };
export const ErrorState: StoryObj<typeof meta> = { args: { errorMessage: COPY.error } };
