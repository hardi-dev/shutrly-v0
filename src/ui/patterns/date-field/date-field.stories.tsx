import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DateField } from "./date-field";
import { DATE_FIELD_STORY_COPY as COPY } from "./date-field.stories.copy";

const meta = {
  title: "Patterns/DateField",
  component: DateField,
  tags: ["autodocs"],
  parameters: { designSystemSpec: "docs/design-system/components/calendar-day.md" },
  args: {
    label: COPY.label,
    placeholder: COPY.placeholder,
    value: "2026-11-10",
    display: "weekday",
    onChange: () => undefined,
  },
} satisfies Meta<typeof DateField>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Empty: StoryObj<typeof meta> = { args: { value: null, display: "date" } };
export const ErrorState: StoryObj<typeof meta> = {
  args: { value: null, display: "date", errorMessage: COPY.error },
};
