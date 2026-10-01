import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StatusChip } from "./status-chip";
import { STATUS_CHIP_STORY_COPY as COPY } from "./status-chip.stories.copy";

const meta = {
  title: "Primitives/Status Chip",
  component: StatusChip,
  parameters: { designSystemSpec: "docs/design-system/components/status-chip.md" },
} satisfies Meta<typeof StatusChip>;

export default meta;

export const Success: StoryObj<typeof meta> = {
  args: { tone: "success", label: COPY.labels.success },
};
export const Info: StoryObj<typeof meta> = { args: { tone: "info", label: COPY.labels.info } };
export const Warning: StoryObj<typeof meta> = {
  args: { tone: "warning", label: COPY.labels.warning },
};
export const Danger: StoryObj<typeof meta> = {
  args: { tone: "danger", label: COPY.labels.danger },
};
export const Accent: StoryObj<typeof meta> = {
  args: { tone: "accent", label: COPY.labels.accent },
};
export const Neutral: StoryObj<typeof meta> = {
  args: { tone: "neutral", label: COPY.labels.neutral },
};
export const NoDot: StoryObj<typeof meta> = {
  args: { tone: "neutral", label: COPY.labels.noDot, hasDot: false },
};
