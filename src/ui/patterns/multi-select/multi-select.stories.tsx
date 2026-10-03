import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MultiSelect } from "./multi-select";
import { MULTI_SELECT_STORY_COPY as COPY } from "./multi-select.stories.copy";

const meta = {
  title: "Patterns/Multi-select",
  component: MultiSelect,
  tags: ["autodocs"],
  parameters: { designSystemSpec: "docs/design-system/components/multi-select.md" },
  args: {
    label: COPY.label,
    placeholder: COPY.placeholder,
    options: [
      { id: "BOOKED", label: COPY.booked },
      { id: "SHOOTING", label: COPY.shooting },
      { id: "DRAFT", label: COPY.draft },
    ],
    selectedIds: ["BOOKED", "SHOOTING"],
    onChange: () => undefined,
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Empty: StoryObj<typeof meta> = { args: { selectedIds: [] } };
export const WithCreateAction: StoryObj<typeof meta> = {
  args: {
    selectedIds: ["BOOKED"],
    groupLabel: COPY.group,
    description: COPY.helper,
    createAction: { label: COPY.create, onPress: () => undefined },
  },
};
export const WithError: StoryObj<typeof meta> = {
  args: { selectedIds: [], errorMessage: COPY.error },
};
