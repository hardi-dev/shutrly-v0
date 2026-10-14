import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MetricRing } from "./metric-ring";

const meta = {
  title: "Patterns/Metric Ring",
  component: MetricRing,
  args: { part: 1, total: 2, label: "1 of 2 ready to edit" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof MetricRing>;

export default meta;

export const Half: StoryObj<typeof meta> = {};

export const ThreeQuarters: StoryObj<typeof meta> = {
  args: { part: 3, total: 4, label: "3 of 4 ready to edit" },
};

export const Empty: StoryObj<typeof meta> = {
  args: { part: 0, total: 2, label: "0 of 2 ready to edit" },
};
