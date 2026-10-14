import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MetricRing } from "@/ui/patterns/metric-ring/metric-ring";
import { MetricSpark } from "@/ui/patterns/metric-spark/metric-spark";
import { MetricDelta } from "@/ui/primitives/metric-delta/metric-delta";

import { MetricTile } from "./metric-tile";
import { METRIC_TILE_STORY_COPY as COPY } from "./metric-tile.stories.copy";

const meta = {
  title: "Patterns/Metric Tile",
  component: MetricTile,
  args: { label: COPY.label, value: COPY.value },
  parameters: { layout: "padded" },
} satisfies Meta<typeof MetricTile>;

export default meta;

export const Plain: StoryObj<typeof meta> = {};

export const WithTrendAndSpark: StoryObj<typeof meta> = {
  args: {
    delta: <MetricDelta tone="positive" value={COPY.deltaText} srText={COPY.deltaSrText} />,
    chart: <MetricSpark values={[1, 2, 2, 3, 2, 3, 4]} />,
  },
};

export const WithRing: StoryObj<typeof meta> = {
  args: {
    label: COPY.reviewLabel,
    value: COPY.reviewValue,
    chart: <MetricRing part={1} total={2} label={COPY.ringLabel} />,
  },
};
