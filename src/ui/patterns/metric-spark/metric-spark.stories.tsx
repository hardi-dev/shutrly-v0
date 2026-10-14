import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MetricSpark } from "./metric-spark";
import { METRIC_SPARK_STORY_COPY as COPY } from "./metric-spark.stories.copy";

const meta = {
  title: "Patterns/Metric Spark",
  component: MetricSpark,
  args: { values: [3, 5, 2, 6, 4, 7, 9] },
  parameters: { layout: "centered" },
} satisfies Meta<typeof MetricSpark>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const WithSpokenSummary: StoryObj<typeof meta> = {
  args: { label: COPY.label },
};

export const Empty: StoryObj<typeof meta> = {
  args: { values: [0, 0, 0, 0, 0, 0, 0] },
};
