import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MetricDelta } from "./metric-delta";
import { METRIC_DELTA_STORY_COPY as COPY } from "./metric-delta.stories.copy";

const meta = {
  title: "Primitives/Metric Delta",
  component: MetricDelta,
  args: { tone: "positive", value: COPY.positive },
  parameters: { layout: "centered" },
} satisfies Meta<typeof MetricDelta>;

export default meta;

export const Positive: StoryObj<typeof meta> = {};

export const Warning: StoryObj<typeof meta> = {
  args: { tone: "warning", value: COPY.warning, srText: COPY.srText },
};
